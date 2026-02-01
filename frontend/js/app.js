(function () {
  "use strict";

  var API_BASE = "https://file-redaction-system-production.up.railway.app";
  var FILE_TYPES = [
    { id: "pdf", label: "PDF", icon: "📄", desc: "PDF only", accept: ".pdf" },
    { id: "image", label: "Image", icon: "🖼️", desc: "JPG, PNG", accept: ".jpg,.jpeg,.png" },
    { id: "word", label: "Word", icon: "📝", desc: "DOCX only", accept: ".docx" },
    { id: "excel", label: "Excel", icon: "📊", desc: "XLSX only", accept: ".xlsx" }
  ];
  var ALLOWED_BY_TYPE = {
    pdf: ["pdf"],
    image: ["jpg", "jpeg", "png"],
    word: ["docx"],
    excel: ["xlsx"]
  };

  var currentUser = null;
  var currentFileType = "pdf";
  var selectedFile = null;
  var historyList = [];
  var redacting = false;

  function getFirstNameFromEmail(email) {
    if (!email || typeof email !== "string") return "User";
    var part = email.split("@")[0] || "";
    var name = (part.split(/[._]/)[0] || part);
    return name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "User";
  }

  function getFileTypeFromFilename(filename) {
    var ext = (filename || "").split(".").pop();
    if (ext) ext = ext.toLowerCase();
    if (["pdf"].indexOf(ext) !== -1) return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp"].indexOf(ext) !== -1) return "image";
    if (["doc", "docx"].indexOf(ext) !== -1) return "word";
    if (["xls", "xlsx"].indexOf(ext) !== -1) return "excel";
    return "pdf";
  }

  function showScreen(id) {
    var screens = document.querySelectorAll(".screen");
    screens.forEach(function (el) {
      el.style.display = el.id === id ? "flex" : "none";
    });
    if (id === "dashboard-screen") {
      document.getElementById("welcome-name").textContent = getFirstNameFromEmail(currentUser);
      renderHistory();
      updateFileAccept();
    }
  }

  function goLogin() {
    showScreen("login-screen");
  }

  function goSignup() {
    showScreen("signup-screen");
  }

  function goDashboard() {
    showScreen("dashboard-screen");
  }

  function updateFileAccept() {
    var t = FILE_TYPES.find(function (x) { return x.id === currentFileType; });
    var accept = t ? t.accept : ".pdf";
    var input = document.getElementById("file-input");
    if (input) input.setAttribute("accept", accept);
  }

  // ----- Login -----
  function login() {
    var email = document.getElementById("login-email").value.trim();
    var password = document.getElementById("login-password").value;
    var popup = document.getElementById("login-error-popup");

    fetch(API_BASE + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && (data.error || !data.email)) {
          popup.style.display = "flex";
          popup.setAttribute("aria-hidden", "false");
          return;
        }
        currentUser = data.email;
        goDashboard();
      })
      .catch(function () {
        popup.style.display = "flex";
        popup.setAttribute("aria-hidden", "false");
      });
  }

  document.getElementById("login-btn").addEventListener("click", login);
  document.getElementById("go-signup").addEventListener("click", goSignup);
  document.getElementById("login-error-ok").addEventListener("click", function () {
    document.getElementById("login-error-popup").style.display = "none";
  });
  document.getElementById("login-error-popup").addEventListener("click", function (e) {
    if (e.target === this) {
      this.style.display = "none";
    }
  });

  // ----- Signup -----
  function signup() {
    var first = document.getElementById("signup-first").value.trim();
    var last = document.getElementById("signup-last").value.trim();
    var email = document.getElementById("signup-email").value.trim();
    var password = document.getElementById("signup-password").value;

    fetch(API_BASE + "/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: first,
        last_name: last,
        email: email,
        password: password
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Signup failed");
        return res.json();
      })
      .then(function () {
        alert("Signup successful! Please login.");
        goLogin();
      })
      .catch(function () {
        alert("Signup failed");
      });
  }

  document.getElementById("signup-btn").addEventListener("click", signup);
  document.getElementById("go-login").addEventListener("click", goLogin);

  // ----- Dashboard: file type -----
  var typeTiles = document.querySelectorAll(".type-tile");
  typeTiles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentFileType = btn.getAttribute("data-type");
      typeTiles.forEach(function (b) { b.classList.remove("selected"); });
      btn.classList.add("selected");
      updateFileAccept();
    });
  });

  document.getElementById("file-input").addEventListener("change", function (e) {
    selectedFile = e.target.files[0] || null;
  });

  // ----- Upload -----
  function upload() {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }
    var ext = (selectedFile.name || "").split(".").pop();
    if (ext) ext = ext.toLowerCase();
    var allowed = ALLOWED_BY_TYPE[currentFileType] || [];
    if (allowed.indexOf(ext) === -1) {
      alert("For " + currentFileType + ", please select only: " + (allowed.join(", ").toUpperCase()));
      return;
    }
    if (redacting) return;

    redacting = true;
    var uploadBtn = document.getElementById("upload-btn");
    uploadBtn.textContent = "Redacting…";
    uploadBtn.disabled = true;

    var fd = new FormData();
    fd.append("file", selectedFile);
    fd.append("email", currentUser);

    fetch(API_BASE + "/upload/" + currentFileType, {
      method: "POST",
      body: fd
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (d) {
            throw new Error(d.detail || "Redaction failed");
          });
        }
        return res.json();
      })
      .then(function (data) {
        var outputPath = data && data.download;
        if (outputPath) {
          var pathNorm = outputPath.replace(/\\/g, "/");
          var downloadUrl = pathNorm.indexOf("http") === 0 ? pathNorm : API_BASE + "/" + pathNorm;
          var link = document.createElement("a");
          link.href = downloadUrl;
          link.download = (pathNorm.split("/").pop()) || "redacted";
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        loadHistory();
      })
      .catch(function (err) {
        alert(err.message || "Redaction failed");
      })
      .finally(function () {
        redacting = false;
        uploadBtn.textContent = "Upload & Redact";
        uploadBtn.disabled = false;
      });
  }

  document.getElementById("upload-btn").addEventListener("click", upload);

  // ----- History -----
  function loadHistory() {
    fetch(API_BASE + "/history/" + encodeURIComponent(currentUser))
      .then(function (res) { return res.json(); })
      .then(function (list) {
        historyList = Array.isArray(list) ? list : [];
        historyList.sort(function (a, b) {
          var dateA = a[1] ? new Date(a[1]).getTime() : 0;
          var dateB = b[1] ? new Date(b[1]).getTime() : 0;
          return dateB - dateA;
        });
        renderHistory();
      })
      .catch(function () {});
  }

  function renderHistory() {
    var listEl = document.getElementById("history-list");
    var emptyEl = document.getElementById("history-empty");
    listEl.innerHTML = "";

    if (historyList.length === 0) {
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";

    historyList.forEach(function (h, i) {
      var filename = h[0];
      var dateStr = h[1] || "";
      var itemType = getFileTypeFromFilename(filename);
      var typeInfo = FILE_TYPES.find(function (t) { return t.id === itemType; }) || FILE_TYPES[0];
      var displayName = filename.split("/").pop();
      var href = API_BASE + "/" + filename.replace(/\\/g, "/");

      var li = document.createElement("li");
      li.className = "history-item history-type-" + itemType;

      var badge = document.createElement("span");
      badge.className = "history-type-badge";
      badge.title = typeInfo.label;
      badge.textContent = typeInfo.icon;

      var a = document.createElement("a");
      a.href = href;
      a.download = true;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.textContent = displayName;

      var meta = document.createElement("span");
      meta.className = "history-meta";
      meta.textContent = dateStr;

      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn danger tiny";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", function () { deleteItem(filename); });

      li.appendChild(badge);
      li.appendChild(a);
      li.appendChild(meta);
      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  }

  function deleteItem(filename) {
    fetch(API_BASE + "/history/item?email=" + encodeURIComponent(currentUser) + "&filename=" + encodeURIComponent(filename), {
      method: "DELETE"
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to delete");
        historyList = historyList.filter(function (h) { return h[0] !== filename; });
        renderHistory();
      })
      .catch(function () {
        alert("Failed to delete item");
      });
  }

  function clearHistory() {
    fetch(API_BASE + "/history/" + encodeURIComponent(currentUser), {
      method: "DELETE"
    })
      .then(function () {
        historyList = [];
        renderHistory();
      })
      .catch(function () {});
  }

  document.getElementById("clear-history-btn").addEventListener("click", clearHistory);

  // ----- Sidebar -----
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("sidebar-overlay");

  document.getElementById("sidebar-toggle").addEventListener("click", function () {
    sidebar.classList.toggle("sidebar-open");
    overlay.style.display = sidebar.classList.contains("sidebar-open") ? "block" : "none";
    if (sidebar.classList.contains("sidebar-open")) loadHistory();
  });

  document.getElementById("sidebar-close").addEventListener("click", function () {
    sidebar.classList.remove("sidebar-open");
    overlay.style.display = "none";
  });

  overlay.addEventListener("click", function () {
    sidebar.classList.remove("sidebar-open");
    overlay.style.display = "none";
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.style.display === "block") {
      sidebar.classList.remove("sidebar-open");
      overlay.style.display = "none";
    }
  });

  // ----- Logout -----
  document.getElementById("logout-btn").addEventListener("click", function () {
    currentUser = null;
    selectedFile = null;
    historyList = [];
    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
    document.getElementById("file-input").value = "";
    goLogin();
  });

  // Start on login screen
  showScreen("login-screen");
})();
