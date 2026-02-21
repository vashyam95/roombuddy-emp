import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Header.css";
import logo from "../assets/wellcome_img.png";

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
        <NavLink
          to="/"
          className={({ isActive }) => isActive ? "active-link" : ""}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/add-property"
          className={({ isActive }) => isActive ? "active-link" : ""}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Add Property
        </NavLink>

        <NavLink
          to="/view-property"
          className={({ isActive }) => isActive ? "active-link" : ""}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          All Properties
        </NavLink>

        <NavLink
          to="/view-request"
          className={({ isActive }) => isActive ? "active-link" : ""}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Property Request
        </NavLink>

        <NavLink
          to="/location-request"
          className={({ isActive }) => isActive ? "active-link" : ""}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Location Request
        </NavLink>

        <NavLink
          to="/move-request"
          className={({ isActive }) => isActive ? "active-link" : ""}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Shift Request
        </NavLink>

         <NavLink
          to="/owner-request"
          className={({ isActive }) => isActive ? "active-link" : ""}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Owner Request
        </NavLink>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>

    </header>
  );
}
