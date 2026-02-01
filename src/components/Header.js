import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Header.css";
import logo from "../assets/mainLogo3-removebg-preview.png";

export default function Header({ onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();       // update login state in App.jsx
    navigate("/");    // redirect to login page
  };

  return (
    <header>
      <div className="logo-section">
        <img src={logo} alt="RoomBuddy Logo" className="logo" />
      </div>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(!menuOpen)}>Dashboard</Link>
        <Link to="/add-property" onClick={() => setMenuOpen(!menuOpen)}>Add Property</Link>
        <Link to="/view-property" onClick={() => setMenuOpen(!menuOpen)}>View Property</Link>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}
