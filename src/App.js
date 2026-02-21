import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddProperty from "./pages/AddProperty";
import ViewProperty from "./pages/ViewProperty";
import ViewRequest from "./pages/ViewRequest";
import LocationRequest from "./pages/LocationRequest";
import MoveRequest from "./pages/MoveRequest";
import OwnerRequest from "./pages/OwnerRequest";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedLogin = localStorage.getItem("isLoggedIn");
    if (storedLogin === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <div>
      {isLoggedIn && <Header onLogout={handleLogout} />}

      <Routes>
        {/* LOGIN */}
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          }
        />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/add-property"
          element={isLoggedIn ? <AddProperty /> : <Navigate to="/" />}
        />
        <Route
          path="/view-property"
          element={isLoggedIn ? <ViewProperty /> : <Navigate to="/" />}
        />
         <Route
          path="/view-request"
          element={isLoggedIn ? <ViewRequest /> : <Navigate to="/" />}
        />
         <Route
          path="/location-request"
          element={isLoggedIn ? <LocationRequest /> : <Navigate to="/" />}
        />
          <Route
          path="/move-request"
          element={isLoggedIn ? <MoveRequest /> : <Navigate to="/" />}
        />

          <Route
          path="/owner-request"
          element={isLoggedIn ? <OwnerRequest /> : <Navigate to="/" />}
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
