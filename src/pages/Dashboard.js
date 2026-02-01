import { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

export default function Dashboard() {

  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);


  const fetchProperties = async () => {
    try {
      const res = await axios.get("https://roombuddy-api.onrender.com/api/properties");
      setProperties(res.data.map((p, index) => ({ ...p, id: index + 1 }))); // add local id for rendering
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  };

  const openCount = properties.filter((p) => p.status === "Open").length;
  const closedCount = properties.filter((p) => p.status === "Closed").length;



  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p>Welcome to RoomBuddy Services</p>
      {/* Summary */}
      <div className="property-summary">
        <div className="summary-card open-card">
          <h3>Open Properties</h3>
          <p>{openCount}</p>
        </div>
        <div className="summary-card closed-card">
          <h3>Closed Properties</h3>
          <p>{closedCount}</p>
        </div>
      </div>
    </div>
  );
}
