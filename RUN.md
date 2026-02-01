# How to Run – Copy & Paste Commands

---

## Option 1: Frontend only (no backend setup)

Uses the hosted API. Just open the app in your browser.

**In File Explorer:**  
Double-click:
```
frontend\index.html
```
Or right-click → Open with → Chrome / Edge / Firefox.

---

## Option 2: Run backend locally (PowerShell or CMD)

**Step 1 – Backend (first terminal)**

```powershell
cd c:\Users\mukes\OneDrive\Desktop\file-redaction-system\backend
.\venv\Scripts\activate
pip install -r ..\requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Leave this running. Backend URL: **http://localhost:8000**

**Step 2 – Point frontend to local backend**

Edit `frontend\js\app.js` line 1 to:
```javascript
var API_BASE = "http://localhost:8000";
```

**Step 3 – Open frontend**

- Either double-click `frontend\index.html`,  
- Or in a **second terminal** run:
```powershell
cd c:\Users\mukes\OneDrive\Desktop\file-redaction-system\frontend
npx serve .
```
Then open **http://localhost:3000** in your browser.

---

## Option 3: Use the batch files

**Terminal 1 – start backend**
```cmd
run-backend.bat
```

**Terminal 2 – start frontend**
```cmd
run-frontend.bat
```

(After running backend once, edit `frontend\js\app.js` and set `API_BASE = "http://localhost:8000"` if you want to use local backend.)

---

## Quick reference

| What              | Command / action |
|-------------------|------------------|
| Backend only      | `cd backend` → `venv\Scripts\activate` → `uvicorn main:app --reload --port 8000` |
| Frontend (static) | Double-click `frontend\index.html` |
| Frontend (server) | `cd frontend` → `npx serve .` → open http://localhost:3000 |
