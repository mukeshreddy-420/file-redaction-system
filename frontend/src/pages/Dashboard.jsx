import { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

const FILE_TYPES = [
  { id: "pdf", label: "PDF", icon: "📄", desc: "PDF only", accept: ".pdf" },
  { id: "image", label: "Image", icon: "🖼️", desc: "JPG, PNG", accept: ".jpg,.jpeg,.png" },
  { id: "word", label: "Word", icon: "📝", desc: "DOCX only", accept: ".docx" },
  { id: "excel", label: "Excel", icon: "📊", desc: "XLSX only", accept: ".xlsx" },
];

// Updated URL (removed trailing slash to match code logic)
const API_BASE = "https://file-redaction-system-production.up.railway.app";

function getFirstNameFromEmail(email) {
  if (!email || typeof email !== "string") return "User";
  const part = email.split("@")[0] || "";
  const name = part.split(/[._]/)[0] || part;
  return name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "User";
}

function getFileTypeFromFilename(filename) {
  const ext = (filename || "").split(".").pop()?.toLowerCase();
  if (["pdf"].includes(ext)) return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["xls", "xlsx"].includes(ext)) return "excel";
  return "pdf";
}

export default function Dashboard({ user, setUser }) {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("pdf");
  const [history, setHistory] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [redacting, setRedacting] = useState(false);

  const acceptForType = FILE_TYPES.find((t) => t.id === type)?.accept ?? ".pdf";
  const allowedByType = {
    pdf: ["pdf"],
    image: ["jpg", "jpeg", "png"],
    word: ["docx"],
    excel: ["xlsx"],
  };

  // ---------------- UPLOAD + AUTO-DOWNLOAD ----------------
  const upload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }
    const ext = (file.name || "").split(".").pop()?.toLowerCase();
    const allowed = allowedByType[type] || [];
    if (!allowed.includes(ext)) {
      alert(`For ${type}, please select only: ${allowed.join(", ").toUpperCase()}`);
      return;
    }

    setRedacting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("email", user);
      const res = await axios.post(`${API_BASE}/upload/${type}`, fd);
      const outputPath = res.data?.download;
      if (outputPath) {
        const pathNorm = outputPath.replace(/\\/g, "/");
        const downloadUrl = pathNorm.startsWith("http") ? pathNorm : `${API_BASE}/${pathNorm}`;
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = (pathNorm.split("/").pop()) || "redacted";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      loadHistory();
    } catch (err) {
      alert(err.response?.data?.detail || "Redaction failed");
    } finally {
      setRedacting(false);
    }
  };

  // ---------------- LOAD HISTORY (recent first) ----------------
  const loadHistory = async () => {
    const res = await axios.get(`${API_BASE}/history/${user}`);
    const list = Array.isArray(res.data) ? res.data : [];
    list.sort((a, b) => {
      const dateA = a[1] ? new Date(a[1]).getTime() : 0;
      const dateB = b[1] ? new Date(b[1]).getTime() : 0;
      return dateB - dateA;
    });
    setHistory(list);
  };

  // ---------------- DELETE SINGLE ITEM ----------------
  const deleteItem = async (filename) => {
    try {
      await axios.delete(`${API_BASE}/history/item`, {
        params: {
          email: user,
          filename: filename,
        },
      });

      // update UI immediately
      setHistory((prev) => prev.filter((h) => h[0] !== filename));
    } catch (err) {
      console.error(err);
      alert("Failed to delete item");
    }
  };

  // ---------------- CLEAR ALL HISTORY ----------------
  const clearHistory = async () => {
    await axios.delete(`${API_BASE}/history/${user}`);
    setHistory([]);
  };

  // ---------------- LOGOUT ----------------
  const logout = () => {
    setUser(null);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="dashboard-page">
      {/* Top-left: hamburger menu (3 lines) */}
      <header className="dashboard-header">
        <button
          className="btn btn-hamburger"
          onClick={() => { setShowSidebar(!showSidebar); if (!showSidebar) loadHistory(); }}
          type="button"
          aria-label="Menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </header>

      {/* Left sidebar: History */}
      <aside className={`sidebar ${showSidebar ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">History</h2>
          <button
            className="btn btn-sidebar-close"
            onClick={() => setShowSidebar(false)}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="sidebar-content">
          <button
            className="btn danger small"
            onClick={clearHistory}
            type="button"
          >
            Clear All
          </button>
          {history.length === 0 ? (
            <p className="empty">No files processed yet</p>
          ) : (
            <ul className="history">
              {history.map((h, i) => {
                const itemType = getFileTypeFromFilename(h[0]);
                const typeInfo = FILE_TYPES.find((t) => t.id === itemType) || FILE_TYPES[0];
                return (
                  <li
                    key={i}
                    className={`history-item history-type-${itemType}`}
                  >
                    <span className="history-type-badge" title={typeInfo.label}>
                      {typeInfo.icon}
                    </span>
                    <a
                      href={`${API_BASE}/${h[0].replace(/\\/g, "/")}`}
                      download
                      target="_blank"
                      rel="noreferrer"
                    >
                      {h[0].split("/").pop()}
                    </a>
                    <span className="history-meta">{h[1]}</span>
                    <button
                      className="btn danger tiny"
                      onClick={() => deleteItem(h[0])}
                      type="button"
                    >
                      Delete
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
      {showSidebar && (
        <div
          className="sidebar-overlay"
          onClick={() => setShowSidebar(false)}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
          onKeyDown={(e) => e.key === "Escape" && setShowSidebar(false)}
        />
      )}

      {/* TITLE: top of page, middle */}
      <h1 className="dashboard-title">File Redaction System</h1>

      <div className="dashboard-card">
        <p className="welcome-text">
          Welcome, <b>{getFirstNameFromEmail(user)}</b>
        </p>

        {/* FILE TYPE - shown differently per type */}
        <div className="section">
          <label>File Type</label>
          <div className="type-grid">
            {FILE_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`type-tile type-${t.id} ${type === t.id ? "selected" : ""}`}
                onClick={() => setType(t.id)}
              >
                <span className="type-icon">{t.icon}</span>
                <span className="type-label">{t.label}</span>
                <span className="type-desc">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FILE INPUT - restricted by type */}
        <div className="section">
          <label>Choose file</label>
          <input
            type="file"
            accept={acceptForType}
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button
          className="btn primary"
          onClick={upload}
          type="button"
          disabled={redacting}
        >
          {redacting ? "Redacting…" : "Upload & Redact"}
        </button>
      </div>

      {/* Logout: bottom-left corner */}
      <div className="dashboard-footer">
        <button
          className="btn btn-logout"
          onClick={logout}
          type="button"
        >
          Logout
        </button>
      </div>
    </div>
  );
}