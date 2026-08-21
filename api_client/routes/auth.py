from functools import wraps
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from ..models import db
from ..models.user import ClientUser
from ..services.api_client import ApiClientService

auth_bp = Blueprint("auth", __name__)

def login_required(f):
    """Decorator to require user session login for client dashboard routes."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            flash("Please sign in to access the client dashboard.", "warning")
            return redirect(url_for("auth.login", next=request.url))
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    """Client registration page."""
    if request.method == "POST":
        name = (request.form.get("name") or "").strip()
        email = (request.form.get("email") or "").strip().lower()
        password = request.form.get("password") or ""
        also_register_in_api = request.form.get("also_register_api") == "on"

        if not name or not email or not password:
            flash("All fields are required.", "danger")
            return render_template("register.html", name=name, email=email)

        if len(password) < 6:
            flash("Password must be at least 6 characters.", "danger")
            return render_template("register.html", name=name, email=email)

        # Check existing local user
        if ClientUser.query.filter_by(email=email).first():
            flash("An account with this email already exists in Client application.", "danger")
            return render_template("register.html", name=name, email=email)

        try:
            # 1. Save local user
            new_user = ClientUser(name=name, email=email)
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.commit()

            # 2. Optionally synchronize/register with Project 1 API Provider
            if also_register_in_api:
                api_res = ApiClientService.register_api_user(name, email, password)
                if api_res.get("success"):
                    flash("Registered successfully locally AND on Project 1 API Provider!", "success")
                else:
                    flash(f"Local account created. Project 1 sync note: {api_res.get('message')}", "info")
            else:
                flash("Client account created successfully. Please sign in.", "success")

            return redirect(url_for("auth.login"))
        except Exception as e:
            db.session.rollback()
            flash(f"Registration failed: {str(e)}", "danger")

    return render_template("register.html")

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    """Client login page."""
    if request.method == "POST":
        email = (request.form.get("email") or "").strip().lower()
        password = request.form.get("password") or ""

        if not email or not password:
            flash("Email and password are required.", "danger")
            return render_template("login.html", email=email)

        user = ClientUser.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            flash("Invalid email or password.", "danger")
            return render_template("login.html", email=email)

        # Establish Client Session
        session.clear()
        session["user_id"] = user.id
        session["user_name"] = user.name
        session["user_email"] = user.email

        # Authenticate against Project 1 API Provider to obtain JWT Bearer Token
        api_login_result = ApiClientService.login_api_user(email, password)
        if api_login_result.get("success") and "token" in api_login_result.get("data", {}):
            session["api_jwt_token"] = api_login_result["data"]["token"]
            flash(f"Welcome back, {user.name}! Connected to Project 1 API with active JWT.", "success")
        else:
            # If Project 1 login failed (e.g. user exists locally but not in API, or different password),
            # provide clear status so user can still browse public features or re-sync
            api_msg = api_login_result.get("message", "Could not obtain JWT token.")
            flash(f"Logged into Client Dashboard. API Provider Notice: {api_msg}", "warning")

        next_page = request.args.get("next")
        return redirect(next_page or url_for("dashboard.dashboard_view"))

    return render_template("login.html")

@auth_bp.route("/logout")
def logout():
    """Sign out and clear session."""
    session.clear()
    flash("You have been signed out successfully.", "info")
    return redirect(url_for("auth.login"))
