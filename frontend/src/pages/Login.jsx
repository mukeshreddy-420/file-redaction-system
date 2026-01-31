import { useState } from "react";
import axios from "axios";
import "./Auth.css";

export default function Login({ setUser, setShowSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const login = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/auth/login", {
        email,
        password,
      });
      // Backend may return 200 with { error: "Invalid credentials" } instead of throwing
      if (res.data?.error || !res.data?.email) {
        setShowErrorPopup(true);
        return;
      }
      setUser(res.data.email);
    } catch {
      setShowErrorPopup(true);
    }
  };

  return (
    <div className="auth-page">
      {/* Invalid credentials popup */}
      {showErrorPopup && (
        <div className="auth-popup-overlay" onClick={() => setShowErrorPopup(false)}>
          <div className="auth-popup" onClick={(e) => e.stopPropagation()}>
            <p className="auth-popup-message">Invalid credentials</p>
            <button
              type="button"
              className="btn primary auth-popup-btn"
              onClick={() => setShowErrorPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <h1 className="app-title">File Redaction System</h1>
      <div className="auth-card">
        <h2>🔐 Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn primary" onClick={login}>
          Login
        </button>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button type="button" className="btn-link" onClick={() => setShowSignup(true)}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
