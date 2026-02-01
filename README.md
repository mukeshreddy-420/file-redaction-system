# 🔏 File Redaction System

A privacy-focused, web-based application designed to automatically redact sensitive information from documents and images. The platform supports multiple file formats and processes data securely in memory without permanent storage.

This system is designed strictly for **data privacy and security**.

**Python | Flask | HTML5 | Docker | Railway**

## Objective

To build a robust redaction tool that demonstrates secure file processing capabilities without relying on third-party data handlers.

The application aims to:

* Redact sensitive data from mixed media (PDF, Docs, Images) instantly.
* Ensure zero-persistence data handling (files are wiped after processing).
* Provide a simple, drag-and-drop interface for non-technical users.
* Run efficiently in containerized environments.

## Features

### User Features

* **Multi-Format Support:** PDF, Word (DOCX), Excel (XLSX), and Images (PNG/JPG).
* **Drag-and-Drop Interface:** Intuitive file upload zone.
* **Instant Processing:** Immediate feedback and download links.
* **Visual Confirmation:** Success/Failure status indicators.
* **Responsive Design:** Works on desktop and mobile browsers.

### System Features

* **Zero-Knowledge Architecture:** Files are processed and immediately discarded.
* **Pattern Matching:** Automated detection of sensitive text patterns (optional configuration).
* **Dockerized Deployment:** Consistent environment across local and cloud.
* **Secure Transport:** HTTPS enforcement (on deployment).

## Security and Design Principles

* **No Permanent Storage:** Uploaded and processed files are deleted immediately after the session or download is complete.
* **No User Profiling:** The system does not track user IP addresses or document content statistics.
* **Input Sanitization:** Filenames and mime-types are validated to prevent malicious code execution.
* **Memory Safety:** Large files are processed in chunks to prevent memory overflows.

## System Architecture

### Frontend
- HTML, CSS, vanilla JavaScript (no framework)

### Backend
- FastAPI
- PyMuPDF (PDF processing)
- OpenCV (image face detection)
- python-docx (Word files)
- openpyxl (Excel files)

### Redaction Engine

* **PDF:** Uses `PyMuPDF` or `PyPDF2` for layer flattening and masking.
* **Images:** Uses `OpenCV` to draw redaction boxes.
* **Office:** Uses `python-docx` and `openpyxl` for XML manipulation.

### Deployment

* **Docker** for containerization.
* **Railway** for production hosting.

## Tech Stack

### Processing Libraries

* `Pillow` (Image processing)
* `PyMuPDF` / `ReportLab` (PDF manipulation)
* `python-docx` (Word processing)
* `openpyxl` (Excel processing)

### Containerization & Tooling

* Docker
* Docker Compose
* Gunicorn (WSGI Server)
* Git & GitHub

## Project Structure

```text
file-redaction-system/
│
├── app.py                  # Main Flask application entry point
├── requirements.txt        # Python dependencies
├── Dockerfile              # Container configuration
├── docker-compose.yml      # Multi-container orchestration
│
├── core/
│   ├── __init__.py
│   ├── redactor.py         # Main redaction logic factory
│   ├── pdf_handler.py      # PDF specific logic
│   ├── image_handler.py    # Image specific logic
│   └── docx_handler.py     # Word/Excel logic
│
├── static/
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   ├── js/
│   │   └── main.js         # Frontend upload logic
│   └── images/
│
├── templates/
│   ├── index.html          # Landing page
│   └── result.html         # Download page
│
├── uploads/                # Temp folder (gitignored)
├── processed/              # Temp folder (gitignored)
├── .env                    # Environment variables
└── README.md

```

## Inputs

* **File:** Binary file stream (PDF, DOCX, XLSX, PNG, JPG).
* **Redaction Mode:** (Optional) Manual selection or auto-pattern (e.g., Email, SSN).

## Outputs

* **Processed File:** Downloadable binary stream of the redacted document.
* **Status Code:** JSON response indicating success or specific error type.

## How the Application Works

1. User opens the web application.
2. Selects the file type from the dropdown (PDF, Image, etc.).
3. Drags and drops the sensitive document into the upload area.
4. Clicks **Redact Now**.
5. The backend receives the file, validates the extension, and identifies the content.
6. The specific handler (e.g., `pdf_handler.py`) applies the redaction mask.
7. The system saves the result to a temporary path.
8. User clicks **Download Redacted File**.
9. **Cleanup:** A background job or trigger deletes the files from the server.

## Live Deployment

**Live Web Application:**
[https://accurate-flexibility-production.up.railway.app/](https://accurate-flexibility-production.up.railway.app/)

## Quick Start (Local Development)

### Option 1: Run Locally (Manual Setup)

**Step 1: Clone the Repository**

```bash
git clone https://github.com/your-username/file-redaction-system.git
cd file-redaction-system

```

**Step 2: Setup Virtual Environment**

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

```

**Step 3: Install Dependencies**

```bash
pip install -r requirements.txt

```

**Step 4: Run the Application**

```bash
python app.py

```

The app will be available at `http://127.0.0.1:5000`.

### Option 2: Run Using Docker (Recommended)

**From the project root directory:**

```bash
docker-compose build
docker-compose up

```

Docker will handle all dependencies and expose the app on port 5000 or 8000.

## API Endpoints

### 1. Upload and Redact

**Endpoint:**
`POST /upload`

Uploads a file and initiates the redaction process.

**Request Type:** `multipart/form-data`

**Form Fields:**

* `file` (File Object) – The document to redact.
* `file_type` (string) – "pdf", "image", "docx", etc.

**Response:**

```json
{
  "status": "success",
  "filename": "redacted_document.pdf",
  "download_url": "/download/redacted_document.pdf"
}

```

### 2. Download File

**Endpoint:**
`GET /download/<filename>`

Retrieves the processed file. Once downloaded, the file is queued for deletion.

## Edge Cases and Limitations

### Positive Edge Cases

* **Mixed Extensions:** Handles files with incorrect extensions if MIME type is valid.
* **High Resolution:** Maintains readability of non-redacted parts in high-res images.

### Negative Edge Cases

* **Encrypted PDFs:** Cannot process password-protected PDF files.
* **Complex Formatting:** Heavily formatted Word documents may lose some alignment after redaction.
* **Concurrency:** Extremely high traffic may fill the temporary disk space before cleanup runs.

## Future Enhancements

* **AI-Powered Detection:** Integrate NLP to automatically detect and redact names/emails.
* **Preview Mode:** Allow users to draw boxes on the document before finalizing redaction.
* **Batch Processing:** Upload ZIP files containing multiple documents.
* **API Key Access:** Allow other developers to use the redaction engine programmatically.

## Contributing

Contributions are welcome. You may:

* Submit pull requests for UI improvements.
* Add support for new file formats (e.g., CSV, PPTX).
* Improve the security cleanup logic.

## Authors

* [Mukesh Reddy / Likith ]
