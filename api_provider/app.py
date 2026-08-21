import os
import sys

# Ensure local directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

try:
    from config import Config, ProductionConfig, DevelopmentConfig
    from models import db
    from models.user import User
    from models.api_data import Feature
    from routes.auth import auth_bp
    from routes.api import api_bp
    from routes.dashboard import dashboard_bp
    from services.api_service import make_response
except ImportError:
    from .config import Config, ProductionConfig, DevelopmentConfig
    from .models import db
    from .models.user import User
    from .models.api_data import Feature
    from .routes.auth import auth_bp
    from .routes.api import api_bp
    from .routes.dashboard import dashboard_bp
    from .services.api_service import make_response

def create_app(config_class=None):
    """Application Factory for Flask REST API Provider."""
    app = Flask(__name__)
    
    # Load configuration
    if config_class is None:
        env = os.environ.get("FLASK_ENV", "production")
        config_class = DevelopmentConfig if env == "development" else ProductionConfig
    
    app.config.from_object(config_class)

    # Enable CORS for cross-origin API consumers (like Project 2)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize database
    db.init_app(app)

    # Initialize JWT Manager
    jwt = JWTManager(app)

    # JWT Error handlers for consistent JSON error response
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return make_response(
            False,
            "The access token has expired. Please log in again.",
            errors=["Token expired."],
            status_code=401
        )

    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return make_response(
            False,
            f"Invalid authentication token: {error_string}",
            errors=["Invalid token."],
            status_code=401
        )

    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return make_response(
            False,
            "Authentication token is missing. Please provide 'Authorization: Bearer <token>' header.",
            errors=["Missing Authorization header."],
            status_code=401
        )

    # Register Blueprints
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)

    # Global HTTP Error Handlers
    @app.errorhandler(400)
    def bad_request_error(e):
        return make_response(False, "Bad request. Please verify request syntax and parameters.", errors=[str(e)], status_code=400)

    @app.errorhandler(404)
    def not_found_error(e):
        return make_response(False, "The requested endpoint or resource was not found.", errors=["Resource not found."], status_code=404)

    @app.errorhandler(405)
    def method_not_allowed_error(e):
        return make_response(False, "HTTP method not allowed for this endpoint.", errors=["Method not allowed."], status_code=405)

    @app.errorhandler(500)
    def internal_server_error(e):
        return make_response(False, "An internal server error occurred.", errors=["Internal server error."], status_code=500)

    # Auto-create tables & seed initial data
    with app.app_context():
        os.makedirs(os.path.join(app.root_path, "instance"), exist_ok=True)
        db.create_all()

        # Seed initial admin user if not exists
        if not User.query.filter_by(email="admin@example.com").first():
            admin = User(name="Admin Provider", email="admin@example.com")
            admin.set_password("Admin@123456")
            db.session.add(admin)

            # Seed sample feature records
            sample_features = [
                Feature(
                    title="User Authentication Engine",
                    description="Provides secure JWT token generation, password hashing, and user credential validation for multi-client ecosystems.",
                    category="Security",
                    status="Active"
                ),
                Feature(
                    title="Real-Time Payment Gateway Proxy",
                    description="Processes credit card and digital wallet transactions with end-to-end encryption and webhook confirmations.",
                    category="Finance",
                    status="Active"
                ),
                Feature(
                    title="Automated PDF Report Generator",
                    description="Generates rich analytical summaries and invoices in PDF format with custom branding templates.",
                    category="Reporting",
                    status="Active"
                ),
                Feature(
                    title="SMS & Push Notification Dispatcher",
                    description="High-throughput messaging queue for transactional SMS, push alerts, and priority email notices.",
                    category="Communication",
                    status="Pending"
                ),
                Feature(
                    title="AI Semantic Search Indexer",
                    description="Vector indexing and fast similarity matching across document repositories and catalog databases.",
                    category="AI & ML",
                    status="Active"
                )
            ]
            db.session.bulk_save_objects(sample_features)
            db.session.commit()

    return app

# WSGI Application instance for Gunicorn / Render
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
