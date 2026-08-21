import os
import requests
from typing import Dict, Any, Tuple, Optional, List
from flask import current_app

class ApiClientService:
    """
    Dedicated HTTP Client service for consuming Project 1 REST APIs.
    Handles JWT authentication headers, network timeouts, error handling,
    and response payload parsing.
    """

    @classmethod
    def get_base_url(cls) -> str:
        """Fetch base URL from current app config or fallback."""
        if current_app:
            return current_app.config.get("API_BASE_URL", "http://127.0.0.1:5000").rstrip("/")
        return os.environ.get("API_BASE_URL", "http://127.0.0.1:5000").rstrip("/")

    @classmethod
    def get_timeout(cls) -> int:
        """Fetch request timeout seconds."""
        if current_app:
            return current_app.config.get("API_TIMEOUT", 10)
        return int(os.environ.get("API_TIMEOUT", 10))

    @classmethod
    def _build_headers(cls, jwt_token: Optional[str] = None) -> Dict[str, str]:
        """Construct standard HTTP headers with optional Bearer JWT token."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Flask-API-Consumer/1.0"
        }
        if jwt_token:
            headers["Authorization"] = f"Bearer {jwt_token.strip()}"
        return headers

    @classmethod
    def check_api_health(cls) -> Tuple[bool, str]:
        """Check if Project 1 API Provider is reachable."""
        url = f"{cls.get_base_url()}/api/health"
        try:
            res = requests.get(url, headers=cls._build_headers(), timeout=cls.get_timeout())
            if res.status_code == 200:
                return True, "API Provider is online and responsive."
            return False, f"API Provider returned unexpected status {res.status_code}."
        except requests.exceptions.ConnectionError:
            return False, f"Unable to connect to API server at {cls.get_base_url()}. Service may be offline."
        except requests.exceptions.Timeout:
            return False, "Connection to API Provider timed out."
        except Exception as e:
            return False, f"API check failed: {str(e)}"

    @classmethod
    def register_api_user(cls, name: str, email: str, password: str) -> Dict[str, Any]:
        """Register a user account on Project 1 API Provider."""
        url = f"{cls.get_base_url()}/api/auth/register"
        payload = {"name": name, "email": email, "password": password}

        try:
            res = requests.post(url, json=payload, headers=cls._build_headers(), timeout=cls.get_timeout())
            data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
            return {
                "status_code": res.status_code,
                "success": res.status_code in (200, 201) and data.get("success", False),
                "message": data.get("message", "Registration response received."),
                "data": data.get("data", {}),
                "errors": data.get("errors", [])
            }
        except requests.exceptions.ConnectionError:
            return {
                "status_code": 503,
                "success": False,
                "message": "API Provider unreachable. Please check connection.",
                "errors": ["Connection refused."]
            }
        except requests.exceptions.Timeout:
            return {
                "status_code": 504,
                "success": False,
                "message": "API Provider request timed out.",
                "errors": ["Gateway Timeout."]
            }
        except Exception as e:
            return {
                "status_code": 500,
                "success": False,
                "message": f"Client request error: {str(e)}",
                "errors": [str(e)]
            }

    @classmethod
    def login_api_user(cls, email: str, password: str) -> Dict[str, Any]:
        """Authenticate against Project 1 API Provider to acquire a JWT token."""
        url = f"{cls.get_base_url()}/api/auth/login"
        payload = {"email": email, "password": password}

        try:
            res = requests.post(url, json=payload, headers=cls._build_headers(), timeout=cls.get_timeout())
            data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
            return {
                "status_code": res.status_code,
                "success": res.status_code == 200 and data.get("success", False),
                "message": data.get("message", "Login response received."),
                "data": data.get("data", {}),
                "errors": data.get("errors", [])
            }
        except requests.exceptions.ConnectionError:
            return {
                "status_code": 503,
                "success": False,
                "message": f"Unable to reach API provider at {cls.get_base_url()}.",
                "errors": ["Connection error."]
            }
        except requests.exceptions.Timeout:
            return {
                "status_code": 504,
                "success": False,
                "message": "Login request timed out.",
                "errors": ["Timeout."]
            }
        except Exception as e:
            return {
                "status_code": 500,
                "success": False,
                "message": f"Login failed: {str(e)}",
                "errors": [str(e)]
            }

    @classmethod
    def get_features(cls, category: Optional[str] = None, status: Optional[str] = None, jwt_token: Optional[str] = None) -> Dict[str, Any]:
        """Fetch all feature records from Project 1."""
        url = f"{cls.get_base_url()}/api/features"
        params = {}
        if category:
            params["category"] = category
        if status:
            params["status"] = status

        try:
            res = requests.get(url, params=params, headers=cls._build_headers(jwt_token), timeout=cls.get_timeout())
            data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
            return {
                "status_code": res.status_code,
                "success": res.status_code == 200 and data.get("success", False),
                "message": data.get("message", "Fetched features successfully."),
                "data": data.get("data", {}),
                "errors": data.get("errors", [])
            }
        except requests.exceptions.ConnectionError:
            return {
                "status_code": 503,
                "success": False,
                "message": "Cannot reach API Provider. Make sure Project 1 is running.",
                "data": {"features": []},
                "errors": ["Connection refused."]
            }
        except Exception as e:
            return {
                "status_code": 500,
                "success": False,
                "message": f"Error fetching features: {str(e)}",
                "data": {"features": []},
                "errors": [str(e)]
            }

    @classmethod
    def get_feature_by_id(cls, feature_id: int, jwt_token: Optional[str] = None) -> Dict[str, Any]:
        """Fetch a single feature record by ID from Project 1."""
        url = f"{cls.get_base_url()}/api/features/{feature_id}"

        try:
            res = requests.get(url, headers=cls._build_headers(jwt_token), timeout=cls.get_timeout())
            data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
            return {
                "status_code": res.status_code,
                "success": res.status_code == 200 and data.get("success", False),
                "message": data.get("message", "Feature fetched."),
                "data": data.get("data", {}),
                "errors": data.get("errors", [])
            }
        except Exception as e:
            return {
                "status_code": 500,
                "success": False,
                "message": f"Error fetching feature: {str(e)}",
                "errors": [str(e)]
            }

    @classmethod
    def create_feature(cls, payload: Dict[str, Any], jwt_token: str) -> Dict[str, Any]:
        """Create a new feature via Project 1 API (requires JWT)."""
        url = f"{cls.get_base_url()}/api/features"

        try:
            res = requests.post(url, json=payload, headers=cls._build_headers(jwt_token), timeout=cls.get_timeout())
            data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
            return {
                "status_code": res.status_code,
                "success": res.status_code == 201 and data.get("success", False),
                "message": data.get("message", "Feature creation executed."),
                "data": data.get("data", {}),
                "errors": data.get("errors", [])
            }
        except requests.exceptions.ConnectionError:
            return {
                "status_code": 503,
                "success": False,
                "message": "API Provider unreachable during create operation.",
                "errors": ["Connection error."]
            }
        except Exception as e:
            return {
                "status_code": 500,
                "success": False,
                "message": f"Failed to create feature: {str(e)}",
                "errors": [str(e)]
            }

    @classmethod
    def update_feature(cls, feature_id: int, payload: Dict[str, Any], jwt_token: str) -> Dict[str, Any]:
        """Update an existing feature via Project 1 API (requires JWT)."""
        url = f"{cls.get_base_url()}/api/features/{feature_id}"

        try:
            res = requests.put(url, json=payload, headers=cls._build_headers(jwt_token), timeout=cls.get_timeout())
            data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
            return {
                "status_code": res.status_code,
                "success": res.status_code == 200 and data.get("success", False),
                "message": data.get("message", "Feature update executed."),
                "data": data.get("data", {}),
                "errors": data.get("errors", [])
            }
        except requests.exceptions.ConnectionError:
            return {
                "status_code": 503,
                "success": False,
                "message": "API Provider unreachable during update operation.",
                "errors": ["Connection error."]
            }
        except Exception as e:
            return {
                "status_code": 500,
                "success": False,
                "message": f"Failed to update feature: {str(e)}",
                "errors": [str(e)]
            }

    @classmethod
    def delete_feature(cls, feature_id: int, jwt_token: str) -> Dict[str, Any]:
        """Delete a feature record via Project 1 API (requires JWT)."""
        url = f"{cls.get_base_url()}/api/features/{feature_id}"

        try:
            res = requests.delete(url, headers=cls._build_headers(jwt_token), timeout=cls.get_timeout())
            data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
            return {
                "status_code": res.status_code,
                "success": res.status_code == 200 and data.get("success", False),
                "message": data.get("message", "Feature deletion executed."),
                "data": data.get("data", {}),
                "errors": data.get("errors", [])
            }
        except requests.exceptions.ConnectionError:
            return {
                "status_code": 503,
                "success": False,
                "message": "API Provider unreachable during delete operation.",
                "errors": ["Connection error."]
            }
        except Exception as e:
            return {
                "status_code": 500,
                "success": False,
                "message": f"Failed to delete feature: {str(e)}",
                "errors": [str(e)]
            }
