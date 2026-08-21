import re
from typing import Tuple, Dict, Any, Optional, List
from flask import jsonify, Response
from ..models import db
from ..models.user import User
from ..models.api_data import Feature

def make_response(success: bool, message: str, data: Any = None, errors: Optional[List[str]] = None, status_code: int = 200) -> Tuple[Response, int]:
    """Generate uniform JSON response format across all API endpoints."""
    payload: Dict[str, Any] = {
        "success": success,
        "message": message
    }
    if success:
        payload["data"] = data if data is not None else {}
    else:
        payload["errors"] = errors if errors is not None else []
    
    return jsonify(payload), status_code

def validate_email(email: str) -> bool:
    """Validate email syntax using regex."""
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return bool(re.match(pattern, email))

class AuthService:
    """Authentication business logic service."""
    
    @staticmethod
    def register_user(data: Dict[str, Any]) -> Tuple[Response, int]:
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        errors = []
        if not name:
            errors.append("Field 'name' is required.")
        if not email:
            errors.append("Field 'email' is required.")
        elif not validate_email(email):
            errors.append("Invalid email address format.")
        if not password:
            errors.append("Field 'password' is required.")
        elif len(password) < 6:
            errors.append("Password must be at least 6 characters long.")

        if errors:
            return make_response(False, "Validation failed", errors=errors, status_code=400)

        # Check existing user
        if User.query.filter_by(email=email).first():
            return make_response(False, "An account with this email already exists.", errors=["Email already registered."], status_code=400)

        try:
            new_user = User(name=name, email=email)
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.commit()

            return make_response(
                True,
                "User registered successfully.",
                data={"user": new_user.to_dict()},
                status_code=201
            )
        except Exception as e:
            db.session.rollback()
            return make_response(False, "Failed to register user due to an internal error.", errors=[str(e)], status_code=500)

    @staticmethod
    def authenticate_user(data: Dict[str, Any]) -> Tuple[Optional[User], Optional[str]]:
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not email or not password:
            return None, "Email and password are required."

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return None, "Invalid email or password."

        return user, None


class FeatureService:
    """Feature / Business Entity management service."""

    @staticmethod
    def get_all_features(category: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        query = Feature.query
        if category:
            query = query.filter_by(category=category)
        if status:
            query = query.filter_by(status=status)
        
        features = query.order_by(Feature.created_at.desc()).all()
        return [f.to_dict() for f in features]

    @staticmethod
    def get_feature_by_id(feature_id: int) -> Optional[Feature]:
        return Feature.query.get(feature_id)

    @staticmethod
    def create_feature(data: Dict[str, Any]) -> Tuple[Response, int]:
        title = (data.get("title") or "").strip()
        description = (data.get("description") or "").strip()
        category = (data.get("category") or "General").strip()
        status = (data.get("status") or "Active").strip()

        errors = []
        if not title:
            errors.append("Field 'title' is required.")
        if not description:
            errors.append("Field 'description' is required.")

        valid_statuses = ["Active", "Inactive", "Pending", "Archived"]
        if status not in valid_statuses:
            errors.append(f"Field 'status' must be one of: {', '.join(valid_statuses)}.")

        if errors:
            return make_response(False, "Validation failed", errors=errors, status_code=400)

        try:
            new_feature = Feature(
                title=title,
                description=description,
                category=category,
                status=status
            )
            db.session.add(new_feature)
            db.session.commit()

            return make_response(
                True,
                "Feature created successfully.",
                data={"feature": new_feature.to_dict()},
                status_code=201
            )
        except Exception as e:
            db.session.rollback()
            return make_response(False, "Failed to create feature.", errors=[str(e)], status_code=500)

    @staticmethod
    def update_feature(feature_id: int, data: Dict[str, Any]) -> Tuple[Response, int]:
        feature = Feature.query.get(feature_id)
        if not feature:
            return make_response(False, f"Feature with ID {feature_id} not found.", errors=["Resource not found."], status_code=404)

        title = data.get("title")
        description = data.get("description")
        category = data.get("category")
        status = data.get("status")

        if title is not None:
            title_str = str(title).strip()
            if not title_str:
                return make_response(False, "Field 'title' cannot be empty.", errors=["Invalid title."], status_code=400)
            feature.title = title_str

        if description is not None:
            desc_str = str(description).strip()
            if not desc_str:
                return make_response(False, "Field 'description' cannot be empty.", errors=["Invalid description."], status_code=400)
            feature.description = desc_str

        if category is not None:
            feature.category = str(category).strip() or "General"

        if status is not None:
            valid_statuses = ["Active", "Inactive", "Pending", "Archived"]
            status_str = str(status).strip()
            if status_str not in valid_statuses:
                return make_response(False, f"Status must be one of: {', '.join(valid_statuses)}.", errors=["Invalid status."], status_code=400)
            feature.status = status_str

        try:
            db.session.commit()
            return make_response(
                True,
                "Feature updated successfully.",
                data={"feature": feature.to_dict()},
                status_code=200
            )
        except Exception as e:
            db.session.rollback()
            return make_response(False, "Failed to update feature.", errors=[str(e)], status_code=500)

    @staticmethod
    def delete_feature(feature_id: int) -> Tuple[Response, int]:
        feature = Feature.query.get(feature_id)
        if not feature:
            return make_response(False, f"Feature with ID {feature_id} not found.", errors=["Resource not found."], status_code=404)

        try:
            db.session.delete(feature)
            db.session.commit()
            return make_response(
                True,
                "Feature deleted successfully.",
                data={"deleted_id": feature_id},
                status_code=200
            )
        except Exception as e:
            db.session.rollback()
            return make_response(False, "Failed to delete feature.", errors=[str(e)], status_code=500)
