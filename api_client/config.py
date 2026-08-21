import os

class Config:
    """Project 2 Flask API Client configuration."""
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-api-client-consumer-55443322")
    
    # SQLite Database for Client User Session/Accounts
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'client.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Target Project 1 Base API URL (configured via environment variable)
    API_BASE_URL = os.environ.get("API_BASE_URL", "http://127.0.0.1:5000").rstrip("/")
    
    # API Request Timeout (seconds)
    API_TIMEOUT = int(os.environ.get("API_TIMEOUT", 10))

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
