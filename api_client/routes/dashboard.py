from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app

try:
    from routes.auth import login_required
    from services.api_client import ApiClientService
except ImportError:
    from .auth import login_required
    from ..services.api_client import ApiClientService

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/")
def index():
    """Client landing page."""
    is_online, health_msg = ApiClientService.check_api_health()
    api_url = current_app.config.get("API_BASE_URL", "http://127.0.0.1:5000")
    return render_template("index.html", is_online=is_online, health_msg=health_msg, api_url=api_url)

@dashboard_bp.route("/dashboard")
@login_required
def dashboard_view():
    """Client Dashboard overview."""
    jwt_token = session.get("api_jwt_token")
    is_online, health_msg = ApiClientService.check_api_health()
    
    # Fetch features from Project 1
    api_res = ApiClientService.get_features(jwt_token=jwt_token)
    features = api_res.get("data", {}).get("features", []) if api_res.get("success") else []
    total_records = len(features)
    
    # Calculate category counts
    categories = {}
    for f in features:
        cat = f.get("category", "General")
        categories[cat] = categories.get(cat, 0) + 1

    return render_template(
        "dashboard.html",
        user_name=session.get("user_name"),
        user_email=session.get("user_email"),
        is_online=is_online,
        health_msg=health_msg,
        has_jwt=bool(jwt_token),
        total_records=total_records,
        recent_features=features[:6],
        category_counts=categories,
        api_base_url=ApiClientService.get_base_url()
    )

@dashboard_bp.route("/features")
@login_required
def feature_list():
    """View all business features from Project 1 in a Bootstrap table."""
    category = request.args.get("category")
    status = request.args.get("status")
    jwt_token = session.get("api_jwt_token")

    api_res = ApiClientService.get_features(category=category, status=status, jwt_token=jwt_token)
    if not api_res.get("success"):
        flash(f"API Provider notice: {api_res.get('message', 'Failed to retrieve features.')}", "warning")

    features = api_res.get("data", {}).get("features", [])
    return render_template("features.html", features=features, category=category, status=status)

@dashboard_bp.route("/features/<int:feature_id>")
@login_required
def feature_detail(feature_id: int):
    """View details of a single feature."""
    jwt_token = session.get("api_jwt_token")
    api_res = ApiClientService.get_feature_by_id(feature_id, jwt_token=jwt_token)

    if not api_res.get("success"):
        flash(f"Feature not found or API error: {api_res.get('message')}", "danger")
        return redirect(url_for("dashboard.feature_list"))

    feature = api_res.get("data", {}).get("feature", {})
    return render_template("features.html", single_feature=feature, features=[feature])

@dashboard_bp.route("/features/add", methods=["GET", "POST"])
@login_required
def add_feature():
    """Create a new feature on Project 1."""
    jwt_token = session.get("api_jwt_token")
    if not jwt_token:
        flash("You need an active Project 1 JWT token to create features. Please sync your API credentials below.", "warning")

    if request.method == "POST":
        title = (request.form.get("title") or "").strip()
        description = (request.form.get("description") or "").strip()
        category = (request.form.get("category") or "General").strip()
        status = (request.form.get("status") or "Active").strip()

        if not title or not description:
            flash("Title and Description are required fields.", "danger")
            return render_template("add_feature.html", title=title, description=description, category=category, status=status)

        if not jwt_token:
            flash("Authentication token is missing. Please provide or authenticate with Project 1 API.", "danger")
            return render_template("add_feature.html", title=title, description=description, category=category, status=status)

        payload = {
            "title": title,
            "description": description,
            "category": category,
            "status": status
        }

        api_res = ApiClientService.create_feature(payload, jwt_token)
        if api_res.get("success"):
            flash("Feature created successfully in Project 1 database!", "success")
            return redirect(url_for("dashboard.feature_list"))
        else:
            if api_res.get("status_code") == 401:
                flash("Your API JWT token has expired or is invalid. Please re-authenticate.", "danger")
                session.pop("api_jwt_token", None)
            else:
                errors = ", ".join(api_res.get("errors", []))
                flash(f"Failed to create feature: {api_res.get('message')} {errors}", "danger")

    return render_template("add_feature.html")

@dashboard_bp.route("/features/<int:feature_id>/edit", methods=["GET", "POST"])
@login_required
def edit_feature(feature_id: int):
    """Edit an existing feature on Project 1."""
    jwt_token = session.get("api_jwt_token")

    if request.method == "POST":
        title = (request.form.get("title") or "").strip()
        description = (request.form.get("description") or "").strip()
        category = (request.form.get("category") or "General").strip()
        status = (request.form.get("status") or "Active").strip()

        if not title or not description:
            flash("Title and Description are required.", "danger")
            return render_template("edit_feature.html", feature={"id": feature_id, "title": title, "description": description, "category": category, "status": status})

        if not jwt_token:
            flash("Authentication token is missing. Please sign in to API Provider.", "danger")
            return redirect(url_for("dashboard.feature_list"))

        payload = {
            "title": title,
            "description": description,
            "category": category,
            "status": status
        }

        api_res = ApiClientService.update_feature(feature_id, payload, jwt_token)
        if api_res.get("success"):
            flash(f"Feature #{feature_id} updated successfully in Project 1!", "success")
            return redirect(url_for("dashboard.feature_list"))
        else:
            if api_res.get("status_code") == 401:
                flash("API session expired. Please re-authenticate.", "danger")
                session.pop("api_jwt_token", None)
            else:
                flash(f"Update failed: {api_res.get('message')}", "danger")

    # GET request - fetch current values
    api_res = ApiClientService.get_feature_by_id(feature_id, jwt_token)
    if not api_res.get("success"):
        flash("Could not fetch feature details from Project 1.", "danger")
        return redirect(url_for("dashboard.feature_list"))

    feature = api_res.get("data", {}).get("feature", {})
    return render_template("edit_feature.html", feature=feature)

@dashboard_bp.route("/features/<int:feature_id>/delete", methods=["POST"])
@login_required
def delete_feature(feature_id: int):
    """Delete a feature on Project 1."""
    jwt_token = session.get("api_jwt_token")
    if not jwt_token:
        flash("JWT Bearer token required to delete features. Please authenticate.", "danger")
        return redirect(url_for("dashboard.feature_list"))

    api_res = ApiClientService.delete_feature(feature_id, jwt_token)
    if api_res.get("success"):
        flash(f"Feature #{feature_id} deleted successfully from Project 1 database.", "success")
    else:
        if api_res.get("status_code") == 401:
            flash("API Token expired or invalid.", "danger")
            session.pop("api_jwt_token", None)
        else:
            flash(f"Delete failed: {api_res.get('message')}", "danger")

    return redirect(url_for("dashboard.feature_list"))

@dashboard_bp.route("/sync-token", methods=["POST"])
@login_required
def sync_token():
    """Manually sync or override API JWT token."""
    token = (request.form.get("custom_token") or "").strip()
    if token:
        session["api_jwt_token"] = token
        flash("Project 1 JWT token updated in active session!", "success")
    else:
        # Attempt auto-login using local email and standard admin password or prompt
        api_login = ApiClientService.login_api_user("admin@example.com", "Admin@123456")
        if api_login.get("success") and "token" in api_login.get("data", {}):
            session["api_jwt_token"] = api_login["data"]["token"]
            flash("Auto-synced with Project 1 API Provider using default credentials!", "success")
        else:
            flash(f"Auto-sync failed: {api_login.get('message')}. Please enter token manually.", "danger")

    return redirect(url_for("dashboard.dashboard_view"))
