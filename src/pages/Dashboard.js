import { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";
import data from "./mockDashboardData";

import SectionHeader from "./SectionHeader";
import StatCard from "./StatCard";

import {
  FiDownload,
  FiLogIn,
  FiUsers,
  FiSearch,
  FiEye,
  FiHome,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiDollarSign,
  FiTruck
} from "react-icons/fi";

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
    <>
    
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p>Welcome to RoomBuddy Admin</p>
     
         {/* APP OVERVIEW */}
      <SectionHeader title="App Overview" />
      <div className="stat-grid">
        <StatCard title="Total Downloads" value={data.app.totalDownloads} icon={<FiDownload />} accent="blue" />
        <StatCard title="Total Logins" value={data.app.totalLogins} icon={<FiLogIn />} accent="green" />
        <StatCard title="Active Users" value={data.app.activeUsers} icon={<FiUsers />} accent="purple" />
      </div>

      {/* USER ENGAGEMENT */}
      <SectionHeader title="User Engagement" />
      <div className="stat-grid">
        <StatCard title="Home Searches" value={data.engagement.homeSearches} icon={<FiSearch />} accent="orange" />
        <StatCard title="Property Views" value={data.engagement.propertyViews} icon={<FiEye />} accent="blue" />
        <StatCard title="Properties Added Today" value={data.engagement.propertiesAddedToday} icon={<FiHome />} accent="green" />
      </div>

      {/* PROPERTY STATUS */}
      <SectionHeader title="Property Status" />
      <div className="stat-grid">
        <StatCard title="Active Properties" value={openCount} icon={<FiCheckCircle />} accent="green" />
        <StatCard title="Inactive Properties" value={closedCount} icon={<FiXCircle />} accent="red" />
      </div>

      {/* VISITS */}
      <SectionHeader title="Visit Requests" />
      <div className="stat-grid">
        <StatCard title="Total Visit Requests" value={data.visits.totalRequests} icon={<FiCalendar />} accent="purple" />
        <StatCard title="Today Visit Requests" value={data.visits.todayRequests} icon={<FiCalendar />} accent="orange" />
      </div>

      {/* PAYMENTS */}
      <SectionHeader title="Payments" />
      <div className="stat-grid">
        <StatCard title="Online Payments" value={data.payments.online} icon={<FiDollarSign />} accent="green" />
        <StatCard title="Offline Payments" value={data.payments.offline} icon={<FiDollarSign />} accent="blue" />
      </div>

      {/* SHIFTING */}
      <SectionHeader title="Shifting Status" />
      <div className="stat-grid">
        <StatCard title="Shifts Completed" value={data.shifting.completed} icon={<FiTruck />} accent="green" />
        <StatCard title="Shifts Pending" value={data.shifting.pending} icon={<FiTruck />} accent="orange" />
      </div>
    </div>
    </>
  );
}
