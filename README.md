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
- React
- Vite
- CSS (custom styling)

### Backend
- FastAPI
- SQLite (database)
- PyMuPDF (PDF processing)
- OpenCV (image face detection)
- python-docx (Word files)
- openpyxl (Excel files)

---

## 🧱 System Architecture

