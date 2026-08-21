import { ProjectFile } from '../types';

export const PROJECT_1_FILES: ProjectFile[] = [
  {
    path: 'api_provider/app.py',
    project: 'api_provider',
    language: 'python',
    description: 'Application factory, Flask-JWT-Extended error hooks, CORS, and Gunicorn WSGI entrypoint.',
    content: `import os
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
    
    if config_class is None:
        env = os.environ.get("FLASK_ENV", "production")
        config_class = DevelopmentConfig if env == "development" else ProductionConfig
    
    app.config.from_object(config_class)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    jwt = JWTManager(app)

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return make_response(False, "The access token has expired. Please log in again.", errors=["Token expired."], status_code=401)

    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return make_response(False, f"Invalid authentication token: {error_string}", errors=["Invalid token."], status_code=401)

    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return make_response(False, "Authentication token is missing. Provide 'Authorization: Bearer <token>'.", errors=["Missing Authorization header."], status_code=401)

    app.register_blueprint(dashboard_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)

    @app.errorhandler(400)
    def bad_request_error(e):
        return make_response(False, "Bad request syntax or parameters.", errors=[str(e)], status_code=400)

    @app.errorhandler(404)
    def not_found_error(e):
        return make_response(False, "Endpoint or resource was not found.", errors=["Resource not found."], status_code=404)

    @app.errorhandler(500)
    def internal_server_error(e):
        return make_response(False, "Internal server error occurred.", errors=["Internal server error."], status_code=500)

    with app.app_context():
        os.makedirs(os.path.join(app.root_path, "instance"), exist_ok=True)
        db.create_all()
        if not User.query.filter_by(email="admin@example.com").first():
            admin = User(name="Admin Provider", email="admin@example.com")
            admin.set_password("Admin@123456")
            db.session.add(admin)
            db.session.commit()

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)`
  },
  {
    path: 'api_provider/config.py',
    project: 'api_provider',
    language: 'python',
    description: 'Database connection strings, secret keys, and JWT parameters.',
    content: `import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production-provider-998811")
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'database.db')}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-super-secret-key-for-provider-112233")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.environ.get("JWT_EXPIRATION_HOURS", 24)))
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False`
  },
  {
    path: 'api_provider/models/user.py',
    project: 'api_provider',
    language: 'python',
    description: 'User model with secure Werkzeug password hashing.',
    content: `from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }`
  },
  {
    path: 'api_provider/models/api_data.py',
    project: 'api_provider',
    language: 'python',
    description: 'Feature entity representing business model with CRUD serialization.',
    content: `from datetime import datetime
from . import db

class Feature(db.Model):
    __tablename__ = "features"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False, default="General")
    status = db.Column(db.String(30), nullable=False, default="Active")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }`
  },
  {
    path: 'api_provider/services/api_service.py',
    project: 'api_provider',
    language: 'python',
    description: 'Uniform response constructor, input validation, and CRUD operations.',
    content: `import re
from typing import Tuple, Dict, Any, Optional, List
from flask import jsonify, Response
from ..models import db
from ..models.user import User
from ..models.api_data import Feature

def make_response(success: bool, message: str, data: Any = None, errors: Optional[List[str]] = None, status_code: int = 200) -> Tuple[Response, int]:
    payload = {"success": success, "message": message}
    if success:
        payload["data"] = data if data is not None else {}
    else:
        payload["errors"] = errors if errors is not None else []
    return jsonify(payload), status_code

class AuthService:
    @staticmethod
    def register_user(data: Dict[str, Any]):
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        errors = []
        if not name: errors.append("Field 'name' is required.")
        if not email: errors.append("Field 'email' is required.")
        if not password or len(password) < 6: errors.append("Password must be >= 6 chars.")
        if errors: return make_response(False, "Validation failed", errors=errors, status_code=400)
        if User.query.filter_by(email=email).first():
            return make_response(False, "Email already registered.", errors=["Duplicate email."], status_code=400)
        try:
            u = User(name=name, email=email)
            u.set_password(password)
            db.session.add(u)
            db.session.commit()
            return make_response(True, "User registered successfully.", data={"user": u.to_dict()}, status_code=201)
        except Exception as e:
            db.session.rollback()
            return make_response(False, "Registration error", errors=[str(e)], status_code=500)`
  },
  {
    path: 'api_provider/routes/auth.py',
    project: 'api_provider',
    language: 'python',
    description: 'POST /api/auth/register and POST /api/auth/login JWT endpoints.',
    content: `from flask import Blueprint, request
from flask_jwt_extended import create_access_token
from ..services.api_service import AuthService, make_response

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    if not request.is_json:
        return make_response(False, "Request must be JSON", status_code=400)
    return AuthService.register_user(request.get_json() or {})

@auth_bp.route("/login", methods=["POST"])
def login():
    if not request.is_json:
        return make_response(False, "Request must be JSON", status_code=400)
    data = request.get_json() or {}
    user, err = AuthService.authenticate_user(data)
    if err or not user:
        return make_response(False, err or "Invalid credentials", status_code=401)
    token = create_access_token(identity=str(user.id), additional_claims={"email": user.email, "name": user.name})
    return make_response(True, "Login successful.", data={"token": token, "token_type": "Bearer", "user": user.to_dict()})`
  },
  {
    path: 'api_provider/routes/api.py',
    project: 'api_provider',
    language: 'python',
    description: 'Full CRUD REST API endpoints with @jwt_required protection.',
    content: `from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ..services.api_service import FeatureService, make_response

api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.route("/features", methods=["GET"])
def get_features():
    category = request.args.get("category")
    status = request.args.get("status")
    features = FeatureService.get_all_features(category, status)
    return make_response(True, f"Retrieved {len(features)} feature(s).", data={"features": features, "count": len(features)})

@api_bp.route("/features/<int:feature_id>", methods=["GET"])
def get_feature(feature_id: int):
    feature = FeatureService.get_feature_by_id(feature_id)
    if not feature:
        return make_response(False, "Feature not found.", status_code=404)
    return make_response(True, "Feature retrieved.", data={"feature": feature.to_dict()})

@api_bp.route("/features", methods=["POST"])
@jwt_required()
def create_feature():
    return FeatureService.create_feature(request.get_json() or {})

@api_bp.route("/features/<int:feature_id>", methods=["PUT"])
@jwt_required()
def update_feature(feature_id: int):
    return FeatureService.update_feature(feature_id, request.get_json() or {})

@api_bp.route("/features/<int:feature_id>", methods=["DELETE"])
@jwt_required()
def delete_feature(feature_id: int):
    return FeatureService.delete_feature(feature_id)

@api_bp.route("/health", methods=["GET"])
def health():
    return make_response(True, "API Provider is online and healthy.", data={"status": "online"})`
  },
  {
    path: 'api_provider/requirements.txt',
    project: 'api_provider',
    language: 'text',
    description: 'Production dependencies list for Render / pip.',
    content: `Flask==3.0.3\nFlask-SQLAlchemy==3.1.1\nFlask-JWT-Extended==4.6.0\nFlask-CORS==4.0.1\nWerkzeug==3.0.3\ngunicorn==22.0.0\npython-dotenv==1.0.1`
  },
  {
    path: 'api_provider/Procfile',
    project: 'api_provider',
    language: 'text',
    description: 'Process configuration for Gunicorn server on Render.',
    content: `web: gunicorn "app:app" --workers 4 --bind 0.0.0.0:$PORT`
  },
  {
    path: 'api_provider/runtime.txt',
    project: 'api_provider',
    language: 'text',
    description: 'Python runtime version.',
    content: `python-3.11.9`
  }
];

export const PROJECT_2_FILES: ProjectFile[] = [
  {
    path: 'api_client/app.py',
    project: 'api_client',
    language: 'python',
    description: 'Client WSGI application factory and SQLite initialization.',
    content: `import os
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
    app = Flask(__name__)
    if config_class is None:
        env = os.environ.get("FLASK_ENV", "production")
        config_class = DevelopmentConfig if env == "development" else ProductionConfig

    app.config.from_object(config_class)
    db.init_app(app)
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)

    with app.app_context():
        os.makedirs(os.path.join(app.root_path, "instance"), exist_ok=True)
        db.create_all()
        if not ClientUser.query.filter_by(email="client@example.com").first():
            user = ClientUser(name="Demo Client User", email="client@example.com")
            user.set_password("Client@123456")
            db.session.add(user)
            db.session.commit()

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)`
  },
  {
    path: 'api_client/config.py',
    project: 'api_client',
    language: 'python',
    description: 'Configuration with API_BASE_URL pointing to Project 1.',
    content: `import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-api-client-consumer-55443322")
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'client.db')}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    API_BASE_URL = os.environ.get("API_BASE_URL", "http://127.0.0.1:5000").rstrip("/")
    API_TIMEOUT = int(os.environ.get("API_TIMEOUT", 10))

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False`
  },
  {
    path: 'api_client/services/api_client.py',
    project: 'api_client',
    language: 'python',
    description: 'HTTP communication service with Project 1 using requests + Bearer JWT.',
    content: `import os, requests
from typing import Dict, Any, Tuple, Optional
from flask import current_app

class ApiClientService:
    @classmethod
    def get_base_url(cls) -> str:
        if current_app:
            return current_app.config.get("API_BASE_URL", "http://127.0.0.1:5000").rstrip("/")
        return os.environ.get("API_BASE_URL", "http://127.0.0.1:5000").rstrip("/")

    @classmethod
    def _headers(cls, jwt_token: Optional[str] = None) -> Dict[str, str]:
        h = {"Content-Type": "application/json", "Accept": "application/json"}
        if jwt_token:
            h["Authorization"] = f"Bearer {jwt_token.strip()}"
        return h

    @classmethod
    def check_api_health(cls) -> Tuple[bool, str]:
        try:
            res = requests.get(f"{cls.get_base_url()}/api/health", timeout=5)
            return res.status_code == 200, "Online & responsive"
        except Exception as e:
            return False, f"Provider offline: {str(e)}"

    @classmethod
    def login_api_user(cls, email: str, password: str) -> Dict[str, Any]:
        url = f"{cls.get_base_url()}/api/auth/login"
        try:
            res = requests.post(url, json={"email": email, "password": password}, headers=cls._headers(), timeout=10)
            data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
            return {"status_code": res.status_code, "success": res.status_code == 200, "data": data.get("data", {}), "message": data.get("message")}
        except Exception as e:
            return {"status_code": 503, "success": False, "message": f"Connection error: {str(e)}"}

    @classmethod
    def get_features(cls, category=None, status=None, jwt_token=None):
        url = f"{cls.get_base_url()}/api/features"
        try:
            res = requests.get(url, params={"category": category, "status": status}, headers=cls._headers(jwt_token), timeout=10)
            data = res.json()
            return {"status_code": res.status_code, "success": res.status_code == 200, "data": data.get("data", {})}
        except Exception as e:
            return {"status_code": 503, "success": False, "message": str(e), "data": {"features": []}}

    @classmethod
    def create_feature(cls, payload: Dict[str, Any], jwt_token: str):
        url = f"{cls.get_base_url()}/api/features"
        try:
            res = requests.post(url, json=payload, headers=cls._headers(jwt_token), timeout=10)
            return {"status_code": res.status_code, "success": res.status_code == 201, "data": res.json().get("data", {})}
        except Exception as e:
            return {"status_code": 503, "success": False, "message": str(e)}

    @classmethod
    def update_feature(cls, feature_id: int, payload: Dict[str, Any], jwt_token: str):
        url = f"{cls.get_base_url()}/api/features/{feature_id}"
        try:
            res = requests.put(url, json=payload, headers=cls._headers(jwt_token), timeout=10)
            return {"status_code": res.status_code, "success": res.status_code == 200, "data": res.json().get("data", {})}
        except Exception as e:
            return {"status_code": 503, "success": False, "message": str(e)}

    @classmethod
    def delete_feature(cls, feature_id: int, jwt_token: str):
        url = f"{cls.get_base_url()}/api/features/{feature_id}"
        try:
            res = requests.delete(url, headers=cls._headers(jwt_token), timeout=10)
            return {"status_code": res.status_code, "success": res.status_code == 200, "data": res.json().get("data", {})}
        except Exception as e:
            return {"status_code": 503, "success": False, "message": str(e)}`
  },
  {
    path: 'api_client/routes/auth.py',
    project: 'api_client',
    language: 'python',
    description: 'Local authentication and automatic Project 1 JWT exchange.',
    content: `from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from ..models import db
from ..models.user import ClientUser
from ..services.api_client import ApiClientService

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = ClientUser.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            flash("Invalid credentials.", "danger")
            return render_template("login.html")

        session.clear()
        session["user_id"] = user.id
        session["user_name"] = user.name
        session["user_email"] = user.email

        # Authenticate against Project 1 API Provider
        api_res = ApiClientService.login_api_user(email, password)
        if api_res.get("success") and "token" in api_res.get("data", {}):
            session["api_jwt_token"] = api_res["data"]["token"]
            flash("Signed in and connected to Project 1 API with Bearer JWT!", "success")
        else:
            flash("Signed into Client. API note: Could not obtain JWT token.", "warning")

        return redirect(url_for("dashboard.dashboard_view"))
    return render_template("login.html")

@auth_bp.route("/logout")
def logout():
    session.clear()
    flash("Signed out.", "info")
    return redirect(url_for("auth.login"))`
  },
  {
    path: 'api_client/requirements.txt',
    project: 'api_client',
    language: 'text',
    description: 'Production dependencies list for Render / pip.',
    content: `Flask==3.0.3\nFlask-SQLAlchemy==3.1.1\nrequests==2.32.3\nWerkzeug==3.0.3\ngunicorn==22.0.0\npython-dotenv==1.0.1`
  },
  {
    path: 'api_client/Procfile',
    project: 'api_client',
    language: 'text',
    description: 'Process configuration for Gunicorn on Render.',
    content: `web: gunicorn "app:app" --workers 4 --bind 0.0.0.0:$PORT`
  },
  {
    path: 'api_client/runtime.txt',
    project: 'api_client',
    language: 'text',
    description: 'Python runtime version.',
    content: `python-3.11.9`
  }
];
