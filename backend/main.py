from fastapi import FastAPI, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os

from auth import router as auth_router
from database import cursor, conn
from redact_pdf import redact_pdf
from redact_image import redact_image
from redact_word import redact_word
from redact_excel import redact_excel

# ------------------ APP SETUP ------------------

app = FastAPI()

# Serve uploaded/redacted files
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth routes
app.include_router(auth_router, prefix="/auth")

# ------------------ UPLOAD & REDACTION ------------------

@app.post("/upload/{file_type}")
async def upload(
    file_type: str,
    email: str = Form(...),
    file: UploadFile = File(...)
):
    input_path = f"{UPLOAD_DIR}/{file.filename}"
    output_path = f"{UPLOAD_DIR}/redacted_{file.filename}"

    # Save uploaded file
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Redaction logic
    if file_type == "pdf":
        redact_pdf(input_path, output_path)
    elif file_type == "image":
        redact_image(input_path, output_path)
    elif file_type == "word":
        redact_word(input_path, output_path)
    elif file_type == "excel":
        redact_excel(input_path, output_path)
    else:
        return {"error": "Unsupported file type"}

    # Save history to database
    cursor.execute(
        "INSERT INTO downloads (user_email, filename) VALUES (?, ?)",
        (email, output_path),
    )
    conn.commit()

    return {"download": output_path}

# ------------------ HISTORY ------------------

@app.get("/history/{email}")
def history(email: str):
    cursor.execute(
        "SELECT filename, created_at FROM downloads WHERE user_email=?",
        (email,),
    )
    return cursor.fetchall()

# ------------------ DELETE ALL HISTORY (OPTIONAL) ------------------

@app.delete("/history/{email}")
def delete_all_history(email: str):
    cursor.execute(
        "SELECT filename FROM downloads WHERE user_email=?",
        (email,),
    )
    files = cursor.fetchall()

    for (filename,) in files:
        if os.path.exists(filename):
            os.remove(filename)

    cursor.execute(
        "DELETE FROM downloads WHERE user_email=?",
        (email,),
    )
    conn.commit()

    return {"message": "All download history deleted"}

# ------------------ DELETE SINGLE HISTORY ITEM ------------------

@app.delete("/history/item")
def delete_history_item(
    email: str = Query(...),
    filename: str = Query(...)
):
    # Delete database record
    cursor.execute(
        "DELETE FROM downloads WHERE user_email=? AND filename=?",
        (email, filename),
    )
    conn.commit()

    # Delete file from disk
    if os.path.exists(filename):
        os.remove(filename)

    return {"message": "History item deleted"}
