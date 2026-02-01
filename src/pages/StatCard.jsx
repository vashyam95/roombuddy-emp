import React from "react";

export default function StatCard({ title, value, icon, accent }) {
  return (
    <div className={`stat-card ${accent}`}>
      <div className="stat-top">
        <span className="stat-icon">{icon}</span>
      </div>
      <h2 className="stat-value">{value}</h2>
      <p className="stat-title">{title}</p>
    </div>
  );
}
