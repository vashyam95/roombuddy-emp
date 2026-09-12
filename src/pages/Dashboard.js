import { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

import SectionHeader from "./SectionHeader";
import StatCard from "./StatCard";
import { FiCheckCircle, FiTruck, FiMapPin, FiNavigation } from "react-icons/fi";

const API = "https://roombuddy-api.onrender.com/api";

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [visits, setVisits] = useState([]);
  const [locationRequests, setLocationRequests] = useState([]); // was clobbered
  const [moveRequests, setMoveRequests] = useState([]);         // own state now

  useEffect(() => {
    const load = async (url, onOk) => {
      try {
        const res = await axios.get(url);
        onOk(res.data);
      } catch (err) {
        console.error("Error fetching", url, err);
      }
    };

    load(`${API}/properties`, (d) => {
      const list = Array.isArray(d) ? d : d?.data || [];
      setProperties(list.map((p, i) => ({ ...p, id: i + 1 })));
    });
    load(`${API}/visit-request`, (d) => setVisits(d?.data || []));
    load(`${API}/location-requests`, (d) => setLocationRequests(d?.data || []));
    load(`${API}/move-request`, (d) => setMoveRequests(d?.data || []));
  }, []);

  const by = (list, status) =>
    list.filter((x) => String(x?.status || "").toLowerCase() === status).length;

  const openCount = by(properties, "open");
  const closedCount = by(properties, "closed");

  const visitPending = by(visits, "pending");
  const visitCompleted = by(visits, "completed");

  const locPending = by(locationRequests, "pending");
  const locCompleted = by(locationRequests, "completed");

  const movePending = by(moveRequests, "pending");
  const moveCompleted = by(moveRequests, "completed");

  return (
    <div className="rb-dashboard">
      <header className="rb-dashboard__header">
        <div>
          <h2 className="rb-dashboard__title">Dashboard</h2>
          <p className="rb-dashboard__subtitle">Welcome to RoomBuddy Admin</p>
        </div>
        <div className="rb-dashboard__badge">Live</div>
      </header>

      <SectionHeader title="Properties" />
      <div className="stat-grid">
        <StatCard title="Total Properties" value={openCount + closedCount} icon={<FiCheckCircle />} accent="orange" />
        <StatCard title="Active Properties" value={openCount} icon={<FiCheckCircle />} accent="green" />
      </div>

      <SectionHeader title="Property Visits" />
      <div className="stat-grid">
        <StatCard title="Total Property Visit Requests" value={visitPending + visitCompleted} icon={<FiNavigation />} accent="orange" />
        <StatCard title="Property Visit Completed Requests" value={visitCompleted} icon={<FiNavigation />} accent="green" />
      </div>

      <SectionHeader title="Total Locations" />
      <div className="stat-grid">
        <StatCard title="Total Location Requests" value={locPending + locCompleted} icon={<FiMapPin />} accent="orange" />
        <StatCard title="Total Location Request Completed" value={locCompleted} icon={<FiMapPin />} accent="green" />
      </div>

      <SectionHeader title="Total Shifts" />
      <div className="stat-grid">
        <StatCard title="Total Shifts" value={movePending + moveCompleted} icon={<FiTruck />} accent="green" />
        <StatCard title="Shifts Completed" value={moveCompleted} icon={<FiTruck />} accent="orange" />
      </div>
    </div>
  );
}
