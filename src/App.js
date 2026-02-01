import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddProperty from "./pages/AddProperty";
import ViewProperty from "./pages/ViewProperty";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🔹 Load login state from localStorage when app starts
  useEffect(() => {
    const storedLogin = localStorage.getItem("isLoggedIn");
    if (storedLogin === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // 🔹 Login handler
  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  // 🔹 Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <div>
      {isLoggedIn && <Header onLogout={handleLogout} />}
      <Routes>
        {!isLoggedIn ? (
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-property" element={<AddProperty />} />
            <Route path="/view-property" element={<ViewProperty />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </div>
  );
}
