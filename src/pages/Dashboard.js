import { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";
import data from "./mockDashboardData";

import SectionHeader from "./SectionHeader";
import StatCard from "./StatCard";

import {
  FiCheckCircle,
  FiTruck,
  FiMapPin,
  FiNavigation
} from "react-icons/fi";

export default function Dashboard() {

  const [properties, setProperties] = useState([]);

  const [visits, setVisits] = useState([]);

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchProperties();
    fetchVisits();
    fetchRequests();
    fetchMoveRequests();
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


  const fetchVisits = async () => {
    try {
      const res = await axios.get(
        "https://roombuddy-api.onrender.com/api/visit-request"
      );
      setVisits(res.data.data);
    } catch (err) {
      console.error("Error fetching visits:", err);
    }
  };

  // SUMMARY COUNTS
  const visitpendingCount = visits.filter(v => v.status === "pending").length;
  const visitcompletedCount = visits.filter(v => v.status === "completed").length;


  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "https://roombuddy-api.onrender.com/api/location-requests"
      );
      setRequests(res.data.data || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  // SUMMARY COUNTS
  const locationpendingCount = requests.filter(
    (r) => r.status === "pending"
  ).length;

  const locationcompletedCount = requests.filter(
    (r) => r.status === "completed"
  ).length;



   const fetchMoveRequests = async () => {
        try {
            const res = await axios.get(
                "https://roombuddy-api.onrender.com/api/move-request"
            );
            setRequests(res.data.data || []);
        } catch (err) {
            console.error("Error fetching move requests:", err);
        }
    };

    // SUMMARY COUNTS
    const pendingMoveCount = requests.filter(
        (r) => r.status === "pending"
    ).length;

    const completedMoveCount = requests.filter(
        (r) => r.status === "completed"
    ).length;


  return (
    <>

      <div className="dashboard">
        <h2>Dashboard</h2>
        <p>Welcome to RoomBuddy Admin</p>

        {/* APP OVERVIEW */}
        {/* <SectionHeader title="App Overview" />
      <div className="stat-grid">
        <StatCard title="Total Downloads" value={data.app.totalDownloads} icon={<FiDownload />} accent="blue" />
        <StatCard title="Total Logins" value={data.app.totalLogins} icon={<FiLogIn />} accent="green" />
        <StatCard title="Active Users" value={data.app.activeUsers} icon={<FiUsers />} accent="purple" />
      </div> */}

        {/* USER ENGAGEMENT */}
        {/* <SectionHeader title="User Engagement" />
      <div className="stat-grid">
        <StatCard title="Home Searches" value={data.engagement.homeSearches} icon={<FiSearch />} accent="orange" />
        <StatCard title="Property Views" value={data.engagement.propertyViews} icon={<FiEye />} accent="blue" />
        <StatCard title="Properties Added Today" value={data.engagement.propertiesAddedToday} icon={<FiHome />} accent="green" />
      </div> */}

        {/* PROPERTY STATUS */}
        <SectionHeader title="Properties" />
        <div className="stat-grid">
          <StatCard title="Total Properties" value={openCount + closedCount} icon={<FiCheckCircle />} accent="orange" />
          <StatCard title="Active Properties" value={openCount} icon={<FiCheckCircle />} accent="green"  />
        </div>

        {/* VISITS */}
        <SectionHeader title="Property Visits" />
        <div className="stat-grid">
          <StatCard title="Total Property Visit Requests" value={visitpendingCount + visitcompletedCount} icon={<FiNavigation />} accent="orange" />
          <StatCard title="Property Visit Completed Requests" value={visitcompletedCount} icon={<FiNavigation />} accent="green" />
        </div>

        {/* Location */}
        <SectionHeader title="Total Locations" />
        <div className="stat-grid">
          <StatCard title="Total Location Requests" value={locationpendingCount + locationcompletedCount} icon={<FiMapPin />} accent="orange" />
          <StatCard title="Total Location Request Completed" value={locationcompletedCount} icon={<FiMapPin />} accent="green" />
        </div>

        {/* SHIFTING */}
        <SectionHeader title="Total Shifts" />
      <div className="stat-grid">
        <StatCard title="Total Shifts" value={pendingMoveCount + completedMoveCount} icon={<FiTruck />} accent="green" />
        <StatCard title="Shifts Completed" value={completedMoveCount} icon={<FiTruck />} accent="orange" />
      </div>
      </div>
    </>
  );
}
