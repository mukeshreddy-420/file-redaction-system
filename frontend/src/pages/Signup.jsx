import { useState } from "react";
import axios from "axios";
import "./Auth.css";

export default function Signup({ setShowSignup }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/auth/signup", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });
      alert("Signup successful! Please login.");
      setShowSignup(false);
    } catch {
      alert("Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <h1 className="app-title">File Redaction System</h1>
      <div className="auth-card">
        <h2>📝 Sign up</h2>

        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

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

        <button className="btn primary" onClick={signup}>
          Sign up
        </button>

        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button" className="btn-link" onClick={() => setShowSignup(false)}>
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}
