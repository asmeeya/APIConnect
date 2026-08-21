# Project 1: Flask REST API Provider

A scalable, production-ready Flask REST API backend featuring JWT authentication, SQLite database management with Flask-SQLAlchemy, comprehensive CRUD operations, interactive Bootstrap 5 API documentation, and Render production deployment setup.

---

## 1. Project Overview

The **Flask REST API Provider** serves as the central backend API microservice for client applications. It provides:
- Secure JWT-based user authentication (`/api/auth/register`, `/api/auth/login`).
- Full CRUD API operations for business data (`/api/features`).
- Standardized, consistent JSON response schemas (`success`, `message`, `data`, `errors`).
- HTTP status code adherence (200, 201, 400, 401, 403, 404, 500).
- Interactive Bootstrap 5 documentation UI (`/api-docs`).
- Admin statistical dashboard (`/dashboard`).

---

## 2. Technology Stack

* **Language:** Python 3.11+
* **Framework:** Flask 3.0.3
* **Database & ORM:** SQLite & Flask-SQLAlchemy 3.1.1
* **Authentication:** Flask-JWT-Extended 4.6.0 with Werkzeug password hashing
* **CORS:** Flask-CORS 4.0.1
* **Production Server:** Gunicorn 22.0.0
* **Frontend:** Bootstrap 5.3, HTML5, CSS3, JavaScript

---

## 3. Project Structure

```text
api_provider/
│
├── app.py                     # Application factory and WSGI entry point
├── config.py                  # Environment and database configuration
├── requirements.txt           # Python dependencies
├── runtime.txt                # Python runtime specification (3.11.9)
├── Procfile                   # Process file for Render / Gunicorn
├── .gitignore                 # Git ignore rules
├── README.md                  # Comprehensive project documentation
│
├── instance/
│   └── database.db            # SQLite database file
│
├── models/
│   ├── __init__.py            # SQLAlchemy database instance
│   ├── user.py                # User database model with password hashing
│   └── api_data.py            # Feature / Business Data model
│
├── routes/
│   ├── __init__.py
│   ├── auth.py                # JWT authentication endpoints
│   ├── api.py                 # REST API CRUD endpoints
│   └── dashboard.py           # Web UI and API Docs routes
│
├── services/
│   ├── __init__.py
│   └── api_service.py         # Business logic and response formatter
│
├── templates/
│   ├── base.html              # Shared Bootstrap 5 layout
│   ├── index.html             # Landing page
│   ├── login.html             # User login page
│   ├── register.html          # User registration page
│   ├── dashboard.html         # Admin metrics dashboard
│   └── api_docs.html          # Interactive API documentation
│
└── static/
    ├── css/
    │   └── style.css          # Custom styling and branding
    └── js/
        └── main.js            # Client-side validation and copy utilities
```

---

## 4. Local Installation & Setup

### Step 1: Clone or Navigate to the Directory
```bash
cd api_provider
```

### Step 2: Create and Activate Virtual Environment
```bash
# Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# Windows:
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables (Optional for local dev)
Create a `.env` file in `api_provider/`:
```env
SECRET_KEY=dev-secret-key-change-in-production-provider-998811
JWT_SECRET_KEY=jwt-super-secret-key-for-provider-112233
JWT_EXPIRATION_HOURS=24
FLASK_ENV=development
PORT=5000
```

### Step 5: Run the Application Locally
```bash
python app.py
```
The server will boot on `http://127.0.0.1:5000`.

Default seeded credentials:
- **Email:** `admin@example.com`
- **Password:** `Admin@123456`

---

## 5. REST API Documentation

### Base URL: `http://127.0.0.1:5000/api`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register new user account |
| `POST` | `/api/auth/login` | No | Authenticate user & get JWT token |
| `GET` | `/api/features` | No | List all features with query filters |
| `GET` | `/api/features/<id>` | No | Retrieve single feature by ID |
| `POST` | `/api/features` | **Yes (Bearer JWT)** | Create a new business feature |
| `PUT` | `/api/features/<id>` | **Yes (Bearer JWT)** | Update existing feature |
| `DELETE` | `/api/features/<id>` | **Yes (Bearer JWT)** | Delete a feature record |
| `GET` | `/api/health` | No | Service health check |

### Standard JSON Response Schema

**Success Example (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Feature created successfully.",
  "data": {
    "feature": {
      "id": 1,
      "title": "Payment Gateway",
      "description": "Processes online transactions.",
      "category": "Finance",
      "status": "Active",
      "created_at": "2026-08-21T02:00:00.000000",
      "updated_at": "2026-08-21T02:00:00.000000"
    }
  }
}
```

**Error Example (HTTP 400/401/404/500):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Field 'title' is required."
  ]
}
```

---

## 6. Git & GitHub Push Commands

Execute in your `api_provider` project root:

```bash
# 1. Initialize Git repository
git init

# 2. Stage all project files
git add .

# 3. Create initial commit
git commit -m "Initial commit - Flask REST API Provider"

# 4. Rename default branch to main
git branch -M main

# 5. Link to your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/flask-api-provider.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 7. Render Deployment Guide

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → Select **Web Service**.
3. Connect your GitHub repository `flask-api-provider`.
4. Configure service settings:
   - **Name:** `flask-api-provider` (or custom name)
   - **Environment:** `Python 3`
   - **Branch:** `main`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn "app:app" --workers 4 --bind 0.0.0.0:$PORT`
5. Set Environment Variables in Render:
   - `SECRET_KEY` = `generate-a-strong-random-hex-key`
   - `JWT_SECRET_KEY` = `generate-a-strong-jwt-secret-key`
   - `JWT_EXPIRATION_HOURS` = `24`
   - `FLASK_ENV` = `production`
6. Click **Create Web Service**.
7. Once deployed, note down your live API Base URL:
   `https://your-api-provider.onrender.com`
