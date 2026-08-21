import os
import sys

# Ensure local directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from flask import Flask, render_template

try:
    from config import Config, ProductionConfig, DevelopmentConfig
    from models import db
    from models.user import ClientUser
    from routes.auth import auth_bp
    from routes.dashboard import dashboard_bp
except ImportError:
    from .config import Config, ProductionConfig, DevelopmentConfig
    from .models import db
    from .models.user import ClientUser
    from .routes.auth import auth_bp
    from .routes.dashboard import dashboard_bp

def create_app(config_class=None):
    """Application Factory for Flask API Client Dashboard (Project 2)."""
    app = Flask(__name__)

    # Load configuration
    if config_class is None:
        env = os.environ.get("FLASK_ENV", "production")
        config_class = DevelopmentConfig if env == "development" else ProductionConfig

    app.config.from_object(config_class)

    # Initialize client database
    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)

    # Error Pages
    @app.errorhandler(404)
    def not_found_page(e):
        return render_template("base.html", custom_error="Page not found (404)."), 404

    @app.errorhandler(500)
    def internal_error_page(e):
        return render_template("base.html", custom_error="Internal client application error (500)."), 500

    # Auto-create tables & seed default test client user
    with app.app_context():
        os.makedirs(os.path.join(app.root_path, "instance"), exist_ok=True)
        db.create_all()

        if not ClientUser.query.filter_by(email="client@example.com").first():
            user = ClientUser(name="Demo Client User", email="client@example.com")
            user.set_password("Client@123456")
            db.session.add(user)
            db.session.commit()

    return app

# WSGI Application instance for Gunicorn / Render
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)
