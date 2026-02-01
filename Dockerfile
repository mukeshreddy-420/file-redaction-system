# Use python 3.10
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set work directory to /app
WORKDIR /app

# Install system dependencies for PDF/Image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    poppler-utils \
    tesseract-ocr \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install python dependencies
# (Make sure your requirements.txt has 'numpy<2')
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files
COPY . .

# --- CRITICAL CHANGE: Move into the backend folder ---
WORKDIR /app/backend

# Expose port 5000
EXPOSE 5000

# Start the app using uvicorn pointing to 'main.py'
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]