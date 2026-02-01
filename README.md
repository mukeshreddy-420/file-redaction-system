# 🔐 File Redaction Web Application

A full-stack web application that allows users to **securely redact sensitive information**
from different document types **while preserving the original file format**.

This project was built as a **hackathon / academic project** with a focus on correctness,
usability, and real-world relevance.

---

## 🚀 Features

- User **Signup & Login**
- Upload and redact files
- Supports multiple document formats
- Download redacted files
- View download history
- Delete individual history items
- Clear entire history
- Logout functionality
- Clean and responsive UI

---

## 📂 Supported File Types

| File Type | Redaction Method |
|----------|------------------|
| PDF | Selective text redaction using overlays |
| Images (JPG / PNG) | Automatic **face detection & redaction** |
| Word (DOCX) | Selective sensitive text masking |
| Excel (XLSX) | Cell content masking while preserving structure |

---

## 🛠️ Tech Stack

### Frontend
- HTML, CSS, vanilla JavaScript (no framework)
- Single-page app with login, signup, and dashboard

### Backend
- FastAPI
- SQLite (database)
- PyMuPDF (PDF processing)
- OpenCV (image face detection)
- python-docx (Word files)
- openpyxl (Excel files)

---

## ▶️ How to run

### Option A: Frontend only (uses hosted API)

The frontend is configured to use the hosted backend at `https://file-redaction-system-production.up.railway.app`.

1. **Open the frontend in a browser**
   - Double-click `frontend/index.html`, or  
   - Right-click → Open with → your browser.

2. Sign up / log in and use the app. No local backend needed.

---

### Option B: Run everything locally

**1. Backend**

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r ../requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be at **http://localhost:8000**.

**2. Point the frontend at your local backend**

Edit `frontend/js/app.js` and change the first line to:

```javascript
var API_BASE = "http://localhost:8000";
```

**3. Serve the frontend (recommended)**

From a new terminal:

```bash
cd frontend
npx serve .
```

Then open the URL shown (e.g. **http://localhost:3000**) in your browser.

Or open `frontend/index.html` directly in the browser; it will still work if the backend is running and you set `API_BASE` to `http://localhost:8000`.

---

## 🧱 System Architecture

