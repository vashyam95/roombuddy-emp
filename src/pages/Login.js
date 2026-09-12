import { useState } from "react";
import { User, Lock, Eye, EyeOff, ArrowRight, MapPin } from "lucide-react";
import "./Login.css";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="login-root">
      <div className="login-backdrop" />

      {loading && (
        <div className="login-overlay">
          <div className="login-overlay-card">
            <span className="login-spinner login-spinner--lg" />
            <p>Logging in...</p>
          </div>
        </div>
      )}

      <div className="login-card">

        <div className="login-brand">
          <div className="login-logo">
            <MapPin size={28} strokeWidth={2} />
          </div>
          <h1 className="login-brand-name">RoomBuddy</h1>
          <p className="login-brand-tagline">Admin Portal</p>
        </div>

        <div className="login-header">
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">Sign in to continue</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label" htmlFor="username">
              Username
            </label>
            <div className="login-input-wrap">
              <User className="login-input-icon" size={18} />
              <input
                id="username"
                type="text"
                className="login-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">
              Password
            </label>
            <div className="login-input-wrap">
              <Lock className="login-input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              <span className="login-spinner-wrap">
                <span className="login-spinner" />
                <span>Logging in...</span>
              </span>
            ) : (
              <span className="login-submit-content">
                <span>Login</span>
                <ArrowRight size={18} />
              </span>
            )}
          </button>

          {error && <p className="login-error">{error}</p>}
        </form>

        <p className="login-footnote">Employee access only</p>
      </div>
    </div>
  );
}
