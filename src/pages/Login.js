import { useState } from "react";
import "./Login.css";
import loginImg from "../assets/wellcome_img.png"; // image path

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === "employee@RB" && password === "rb@2025") {
      setError("");
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
        onLogin();
      }, 3000);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
  <div className="login-container">
    {loading && (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Logging in...</p>
      </div>
    )}

    {/* 👇 WRAP LOGO + BOX TOGETHER */}
    <div className="login-content">
      <img src={loginImg} alt="Login" className="login-top-image" />

      <form className="login-box" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          Login
        </button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  </div>
);

}
