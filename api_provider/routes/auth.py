from flask import Blueprint, request
from flask_jwt_extended import create_access_token

try:
    from services.api_service import AuthService, make_response
except ImportError:
    from ..services.api_service import AuthService, make_response

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user account.
    Expects JSON: { "name": str, "email": str, "password": str }
    """
    if not request.is_json:
        return make_response(False, "Request payload must be valid JSON.", errors=["Unsupported Media Type."], status_code=400)
    
    data = request.get_json() or {}
    return AuthService.register_user(data)

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate user and return JWT access token.
    Expects JSON: { "email": str, "password": str }
    """
    if not request.is_json:
        return make_response(False, "Request payload must be valid JSON.", errors=["Unsupported Media Type."], status_code=400)

    data = request.get_json() or {}
    user, error_msg = AuthService.authenticate_user(data)

    if error_msg or not user:
        return make_response(False, error_msg or "Invalid email or password.", errors=["Authentication failed."], status_code=401)

    # Generate JWT token using user identity (email/id)
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "email": user.email,
            "name": user.name
        }
    )

    return make_response(
        True,
        "Login successful. JWT token issued.",
        data={
            "token": access_token,
            "token_type": "Bearer",
            "user": user.to_dict()
        },
        status_code=200
    )
