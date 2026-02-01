const API_BASE = "https://file-redaction-system-production.up.railway.app"; 

let selectedFile = null;

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    checkBackend();
});

async function checkBackend() {
    try {
        await fetch(`${API_BASE}/`);
        console.log("Backend Connected");
    } catch (e) {
        showToast("Backend not connected! Run run-backend.bat", "error");
    }
}

// --- FILE HANDLING ---
function handleFileSelect(event) {
    if (event.target.files.length > 0) {
        selectedFile = event.target.files[0];
        document.getElementById("file-name").innerText = selectedFile.name;
        
        // Hide result area if a new file is picked
        document.getElementById("result-area").classList.add("hidden");
        document.querySelector(".primary-btn").classList.remove("hidden");
    }
}

// --- API ACTIONS ---

async function uploadFile() {
    if (!selectedFile) return showToast("Please select a file first.", "error");

    const fileType = document.getElementById("file-type-selector").value;
    
    // Show Loader
    document.getElementById("loader").classList.remove("hidden");
    document.getElementById("result-area").classList.add("hidden");
    document.querySelector(".primary-btn").classList.add("hidden"); // Hide button while processing

    const formData = new FormData();
    // We send 'anonymous' so the backend doesn't break, but the user doesn't see it.
    formData.append("email", "anonymous"); 
    formData.append("file", selectedFile);

    try {
        const response = await fetch(`${API_BASE}/upload/${fileType}`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.error) throw new Error(result.error);

        // Prepare Download Link
        const downloadUrl = `${API_BASE}/${result.download}`;
        const link = document.getElementById("download-link");
        link.href = downloadUrl;
        link.download = result.download.split('/').pop(); 

        // Show Success UI
        document.getElementById("result-area").classList.remove("hidden");
        showToast("File Redacted Successfully!");

    } catch (error) {
        console.error(error);
        showToast("Error: " + error.message, "error");
        document.querySelector(".primary-btn").classList.remove("hidden"); // Show button again on error
    } finally {
        document.getElementById("loader").classList.add("hidden");
    }
}

function resetUI() {
    selectedFile = null;
    document.getElementById("file-input").value = "";
    document.getElementById("file-name").innerText = "";
    document.getElementById("result-area").classList.add("hidden");
    document.querySelector(".primary-btn").classList.remove("hidden");
}

function showToast(msg, type = "success") {
    const toast = document.getElementById("toast");
    if(!toast) return;
    toast.innerText = msg;
    toast.style.borderLeft = type === "error" ? "5px solid #ff4757" : "5px solid #2ecc71";
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 4000);
}