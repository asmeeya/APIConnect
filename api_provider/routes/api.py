from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

try:
    from services.api_service import FeatureService, make_response
except ImportError:
    from ..services.api_service import FeatureService, make_response

api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.route("/features", methods=["GET"])
def get_features():
    """
    List all business features with optional query filtering.
    Query params: ?category=...&status=...
    """
    category = request.args.get("category")
    status = request.args.get("status")
    features = FeatureService.get_all_features(category=category, status=status)

    return make_response(
        True,
        f"Retrieved {len(features)} feature(s) successfully.",
        data={"features": features, "count": len(features)},
        status_code=200
    )

@api_bp.route("/features/<int:feature_id>", methods=["GET"])
def get_feature(feature_id: int):
    """
    Get a single feature record by ID.
    """
    feature = FeatureService.get_feature_by_id(feature_id)
    if not feature:
        return make_response(
            False,
            f"Feature with ID {feature_id} was not found.",
            errors=["Resource not found."],
            status_code=404
        )

    return make_response(
        True,
        "Feature retrieved successfully.",
        data={"feature": feature.to_dict()},
        status_code=200
    )

@api_bp.route("/features", methods=["POST"])
@jwt_required()
def create_feature():
    """
    Create a new feature record (Protected by JWT).
    Expects JSON: { "title": str, "description": str, "category": str, "status": str }
    """
    if not request.is_json:
        return make_response(False, "Request payload must be JSON.", errors=["Unsupported Media Type."], status_code=400)

    data = request.get_json() or {}
    return FeatureService.create_feature(data)

@api_bp.route("/features/<int:feature_id>", methods=["PUT"])
@jwt_required()
def update_feature(feature_id: int):
    """
    Update an existing feature record (Protected by JWT).
    Expects JSON: { "title"?: str, "description"?: str, "category"?: str, "status"?: str }
    """
    if not request.is_json:
        return make_response(False, "Request payload must be JSON.", errors=["Unsupported Media Type."], status_code=400)

    data = request.get_json() or {}
    return FeatureService.update_feature(feature_id, data)

@api_bp.route("/features/<int:feature_id>", methods=["DELETE"])
@jwt_required()
def delete_feature(feature_id: int):
    """
    Delete a feature record (Protected by JWT).
    """
    return FeatureService.delete_feature(feature_id)

@api_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint for Render and uptime monitoring."""
    return make_response(
        True,
        "Flask REST API Provider is healthy and operational.",
        data={"service": "Flask REST API Provider", "status": "online"},
        status_code=200
    )
