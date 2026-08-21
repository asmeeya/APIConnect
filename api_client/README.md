# Project 2: Flask API Client Dashboard

A complete, production-ready Flask client web application that consumes and interacts with the **Flask REST API Provider (Project 1)**.

---

## 1. Architecture Overview

```text
       ┌────────────────────────────────────────────────────────┐
       │                 End-User / Browser                     │
       └──────────────────────────┬─────────────────────────────┘
                                  │ HTTPS
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │          Project 2: Flask API Client Dashboard         │
       │  - SQLite Session & Local Accounts (client.db)         │
       │  - Bootstrap 5 Responsive User Interface               │
       │  - ApiClientService (Requests + Bearer JWT Header)     │
       └──────────────────────────┬─────────────────────────────┘
                                  │ REST API (JSON / Bearer Token)
                                  │ Configured via API_BASE_URL
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │          Project 1: Flask REST API Provider            │
       │  - Stateless JWT Authentication Engine                 │
       │  - Central Business Entity SQLite Database             │
       │  - Standardized JSON Response Formatter                │
       └────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

* **Language:** Python 3.11+
* **Framework:** Flask 3.0.3
* **HTTP Client:** Requests 2.32.3
* **Database & ORM:** SQLite & Flask-SQLAlchemy 3.1.1 (for local sessions/accounts)
* **Frontend:** Bootstrap 5.3, Bootstrap Icons, HTML5, CSS3, JavaScript
* **Production Server:** Gunicorn 22.0.0

---

## 3. Project Structure

```text
api_client/
│
├── app.py                     # Client application factory and WSGI runner
├── config.py                  # Environment config (API_BASE_URL, SECRET_KEY)
├── requirements.txt           # Python dependencies
├── runtime.txt                # Python 3.11.9 runtime definition
├── Procfile                   # Gunicorn process definition for Render
├── .gitignore                 # Git ignore patterns
├── README.md                  # Comprehensive guide
│
├── instance/
│   └── client.db              # Client SQLite user database
│
├── models/
│   ├── __init__.py            # SQLAlchemy database instance
│   └── user.py                # Client user model (ClientUser)
│
├── routes/
│   ├── __init__.py
│   ├── auth.py                # Local registration, login, JWT session sync
│   └── dashboard.py           # Dashboard, features table, CRUD actions
│
├── services/
│   ├── __init__.py
│   └── api_client.py          # Reusable HTTP client service (requests)
│
├── templates/
│   ├── base.html              # Shared responsive Bootstrap 5 layout
│   ├── index.html             # Client landing page with live API status check
│   ├── login.html             # Client login form
│   ├── register.html          # Client registration with optional API auto-sync
│   ├── dashboard.html         # Consumer overview with metrics and status
│   ├── features.html          # Feature list with search/filter and delete modals
│   ├── add_feature.html       # Create new feature form
│   └── edit_feature.html      # Update feature form
│
└── static/
    ├── css/
    │   └── style.css          # Client UI styles
    └── js/
        └── main.js            # Client-side helpers and modal actions
```

---

## 4. Local Installation & Setup

### Step 1: Navigate to Project 2 Directory
```bash
cd api_client
```

### Step 2: Create & Activate Virtual Environment
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

### Step 4: Configure Environment Variables
Create a `.env` file in `api_client/`:
```env
SECRET_KEY=dev-secret-key-api-client-consumer-55443322
# Point to your running Project 1 API Provider (local or deployed Render URL)
API_BASE_URL=http://127.0.0.1:5000
API_TIMEOUT=10
PORT=5001
FLASK_ENV=development
```

### Step 5: Start the Client Application
```bash
python app.py
```
The client app will launch at `http://127.0.0.1:5001`.

Default seeded client credentials:
- **Email:** `client@example.com`
- **Password:** `Client@123456`

---

## 5. Git & GitHub Push Commands

Execute in your `api_client` project root:

```bash
# 1. Initialize Git repository
git init

# 2. Stage all project files
git add .

# 3. Create initial commit
git commit -m "Initial commit - Flask API Client Dashboard"

# 4. Set main branch
git branch -M main

# 5. Link to your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/flask-api-client.git

# 6. Push to GitHub
git push -u origin main
```

---

## 6. Render Deployment Guide

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Select your `flask-api-client` GitHub repository.
4. Configure service:
   - **Name:** `flask-api-client`
   - **Environment:** `Python 3`
   - **Branch:** `main`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn "app:app" --workers 4 --bind 0.0.0.0:$PORT`
5. **CRITICAL: Set Environment Variables in Render:**
   - `API_BASE_URL` = `https://your-api-provider.onrender.com` *(The URL from Project 1)*
   - `SECRET_KEY` = `generate-a-strong-secret-key-for-client`
   - `API_TIMEOUT` = `10`
   - `FLASK_ENV` = `production`
6. Click **Create Web Service**.

Once deployed, opening `https://your-api-client.onrender.com` will immediately communicate live with your deployed Project 1 API Provider!
