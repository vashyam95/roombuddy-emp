import React from "react";

export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="section-header">
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
