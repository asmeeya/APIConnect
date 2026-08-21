from flask import Blueprint, render_template, redirect, url_for, session
from ..models.user import User
from ..models.api_data import Feature

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/")
def index():
    """Provider landing page."""
    total_users = User.query.count()
    total_features = Feature.query.count()
    return render_template("index.html", total_users=total_users, total_features=total_features)

@dashboard_bp.route("/login")
def login_page():
    """Login UI page for provider."""
    return render_template("login.html")

@dashboard_bp.route("/register")
def register_page():
    """Registration UI page for provider."""
    return render_template("register.html")

@dashboard_bp.route("/dashboard")
def admin_dashboard():
    """Admin dashboard overview."""
    total_users = User.query.count()
    total_features = Feature.query.count()
    recent_features = Feature.query.order_by(Feature.created_at.desc()).limit(10).all()
    categories = [row[0] for row in Feature.query.with_entities(Feature.category).distinct().all()]

    return render_template(
        "dashboard.html",
        total_users=total_users,
        total_features=total_features,
        recent_features=recent_features,
        categories=categories
    )

@dashboard_bp.route("/api-docs")
def api_docs():
    """Interactive Bootstrap API documentation page."""
    return render_template("api_docs.html")
