import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import "./ViewProperty.css";
import axios from "axios";
import jsPDF from "jspdf";

export default function ViewProperty() {
  const [properties, setProperties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);

  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [addressFilter, setAddressFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [furnishingFilter, setFurnishingFilter] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://roombuddy-api.onrender.com/api/properties");
      setProperties(res.data.map((p, index) => ({ ...p, id: index + 1 })));
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCount = properties.filter((p) => p.status === "Open").length;
  const closedCount = properties.filter((p) => p.status === "Closed").length;

  const handleEdit = (id, currentStatus) => {
    setEditingId(id);
    setEditedStatus(currentStatus);
  };

  const handleSave = async (property) => {
    try {
      await axios.put(
        `https://roombuddy-api.onrender.com/api/properties/${property._id}/status`,
        { status: editedStatus }
      );
      setProperties((prev) =>
        prev.map((p) =>
          p._id === property._id ? { ...p, status: editedStatus } : p
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Try again.");
    }
  };

  const filteredProperties = properties.filter((p) => {
    const rent = Number(p.rent);

    return (
      (!addressFilter ||
        p.address?.toLowerCase().includes(addressFilter.toLowerCase())) &&
      (!typeFilter || p.type === typeFilter) &&
      (!furnishingFilter || p.furnishing === furnishingFilter) &&
      (!tenantFilter || p.tenantType === tenantFilter) &&
      (!floorFilter || String(p.floor) === floorFilter) &&
      (!minBudget || rent >= Number(minBudget)) &&
      (!maxBudget || rent <= Number(maxBudget))
    );
  });

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="view-property">
      {/* Hero header */}
      <div className="vp-header">
        <div>
          <h2 className="vp-title">View Properties</h2>
          <p className="vp-subtitle">
            Manage, filter and review your property listings
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            className="lv-hero-btn"
            onClick={fetchProperties}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "lv-spin" : ""} />
            Refresh
          </button>

          <span className="vp-badge">
            {filteredProperties.length} Results
          </span>
        </div>
      </div>
      {/* Summary */}
      <div className="property-summary">
        <div className="summary-card open-card">
          <span className="summary-dot" />
          <h3>Active Properties</h3>
          <p>{openCount}</p>
        </div>
        <div className="summary-card closed-card">
          <span className="summary-dot" />
          <h3>Closed Properties</h3>
          <p>{closedCount}</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters-container">
        <input
          type="text"
          placeholder="🔍  Search Address..."
          value={addressFilter}
          onChange={(e) => {
            setAddressFilter(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="1BHK">1BHK</option>
          <option value="2BHK">2BHK</option>
          <option value="3BHK">3BHK</option>
        </select>

        <select value={furnishingFilter} onChange={(e) => setFurnishingFilter(e.target.value)}>
          <option value="">All Furnishing</option>
          <option value="Furnished">Furnished</option>
          <option value="Semi-Furnished">Semi-Furnished</option>
          <option value="Unfurnished">Unfurnished</option>
        </select>

        <select value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)}>
          <option value="">All Tenants</option>
          <option value="Family">Family</option>
          <option value="Bachelors">Bachelors</option>
          <option value="Anyone">Anyone</option>
        </select>

        <input
          type="number"
          placeholder="Floor"
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
        />

        <input
          type="number"
          placeholder="Min Budget"
          value={minBudget}
          onChange={(e) => {
            setMinBudget(e.target.value);
            setCurrentPage(1);
          }}
        />

        <input
          type="number"
          placeholder="Max Budget"
          value={maxBudget}
          onChange={(e) => {
            setMaxBudget(e.target.value);
            setCurrentPage(1);
          }}
        />

        <button
          className="clear-btn"
          onClick={() => {
            setAddressFilter("");
            setTypeFilter("");
            setFurnishingFilter("");
            setTenantFilter("");
            setFloorFilter("");
             setMinBudget("");
  setMaxBudget("");
          }}
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Address</th>
              <th>Building</th>
              <th>Type</th>
              <th>Furnishing</th>
              <th>Tenant</th>
              <th>Floor</th>
              <th>Area</th>
              <th>Rent</th>
              <th>Advance</th>
              <th>Contact</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="20" className="vp-empty">Loading...</td></tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((p) => (
                <tr key={p._id}>
                  <td
                    className="clickable-address"
                    onClick={() => {
                      setSelectedProperty(p);
                      setShowModal(true);
                    }}
                  >
                    {p.address}
                  </td>
                  <td>{p.building}</td>
                  <td><span className="vp-chip">{p.type}</span></td>
                  <td>{p.furnishing}</td>
                  <td>{p.tenantType}</td>
                  <td>{p.floor}</td>
                  <td>{p.area}</td>
                  <td className="vp-money">₹{p.rent}</td>
                  <td>₹{p.advance}</td>
                  <td>{p.contact}</td>
                  <td>
                    <div className="vp-action-cell">
                      {editingId === p.id ? (
                        <div className="vp-edit-inline">
                          <select
                            value={editedStatus}
                            onChange={(e) => setEditedStatus(e.target.value)}
                          >
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                          </select>
                          <button onClick={() => handleSave(p)} className="save-btn">Save</button>
                        </div>
                      ) : (
                        <>
                          <span className={`vp-status vp-status--${(p.status || "").toLowerCase()}`}>
                            {p.status}
                          </span>
                          <button onClick={() => handleEdit(p.id, p.status)} className="edit-btn">
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="20" className="vp-empty">No properties found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && selectedProperty && (
        <div className="property-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="property-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vp-modal-header">
              <h2>Property Details</h2>
              <button className="vp-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <button
              className="download-all-btn"
              onClick={async () => {
                try {
                  const pdf = new jsPDF("p", "mm", "a4");
                  pdf.setFont("helvetica", "bold");
                  pdf.setFontSize(24);
                  pdf.setTextColor(220, 0, 0);
                  pdf.text("RoomBuddy Property Details", 105, 20, { align: "center" });
                  pdf.setDrawColor(220, 0, 0);
                  pdf.setLineWidth(0.8);
                  pdf.line(20, 25, 190, 25);
                  pdf.setTextColor(0, 0, 0);
                  let y = 40;

                  const details = [
                    ["Type", selectedProperty.type],
                    ["Furnishing", selectedProperty.furnishing],
                    ["Tenant", selectedProperty.tenantType],
                    ["Bike Parking", selectedProperty.bikeparking],
                    ["Car Parking", selectedProperty.carparking],
                    ["Power Backup", selectedProperty.powerBackup],
                    ["Geyser", selectedProperty.geyser],
                    ["Security", selectedProperty.security],
                    ["CCTV", selectedProperty.cctv],
                    ["Bathrooms", selectedProperty.bathrooms],
                    ["Floor", selectedProperty.floor],
                    ["Flat", selectedProperty.flat],
                    ["Colony", selectedProperty.colony],
                    ["Area", selectedProperty.area],
                    ["Rent", selectedProperty.rent],
                    ["Advance", selectedProperty.advance],
                  ];

                  details.forEach(([label, value]) => {
                    pdf.setFont("helvetica", "bold");
                    pdf.setFontSize(14);
                    pdf.text(`${label}`, 20, y);
                    pdf.text(":", 80, y);
                    pdf.setFont("helvetica", "normal");
                    pdf.setFontSize(13);
                    pdf.text(`${value || "-"}`, 90, y);
                    y += 10;
                    if (y > 270) {
                      pdf.addPage();
                      y = 20;
                    }
                  });

                  if (selectedProperty.images?.length > 0) {
                    for (let i = 0; i < selectedProperty.images.length; i++) {
                      pdf.addPage();
                      pdf.setFont("helvetica", "bold");
                      pdf.setFontSize(20);
                      pdf.setTextColor(220, 0, 0);
                      pdf.text("Property Images", 105, 20, { align: "center" });
                      pdf.setDrawColor(220, 0, 0);
                      pdf.setLineWidth(0.8);
                      pdf.line(20, 25, 190, 25);
                      pdf.setTextColor(0, 0, 0);

                      const img = selectedProperty.images[i];
                      try {
                        const response = await fetch(img);
                        const blob = await response.blob();
                        const reader = new FileReader();
                        const base64 = await new Promise((resolve) => {
                          reader.onloadend = () => resolve(reader.result);
                          reader.readAsDataURL(blob);
                        });
                        pdf.addImage(base64, "JPEG", 5, 30, 180, 160);
                      } catch (err) {
                        console.error("Image load failed", err);
                      }
                    }
                  }

                  pdf.save(
                    `RoomBuddy-${selectedProperty.type || "Property"}-${selectedProperty.area || "Area"}.pdf`
                  );
                } catch (err) {
                  console.error("PDF generation failed:", err);
                  alert("Failed to generate PDF");
                }
              }}
            >
              ⬇ Download PDF
            </button>

            <div className="property-images">
              {selectedProperty.images?.length > 0 ? (
                selectedProperty.images.map((img, i) => (
                  <div key={i} className="image-box">
                    <img src={img} alt="property" />
                    <button
                      className="download-btn"
                      onClick={async () => {
                        try {
                          const response = await fetch(img);
                          const blob = await response.blob();
                          const link = document.createElement("a");
                          link.href = URL.createObjectURL(blob);
                          link.download = `property-${i + 1}.jpg`;
                          link.click();
                        } catch (err) {
                          console.error("Download failed", err);
                        }
                      }}
                    >
                      ⬇ Download
                    </button>
                  </div>
                ))
              ) : (
                <p className="vp-noimg">No images</p>
              )}
            </div>

            <div className="vp-details-grid">
              <p>
                <strong>Address:</strong>{" "}
                <span
                  className="vp-address-link"
                  onClick={() => {
                    const url = `https://www.google.com/maps?q=${selectedProperty.latitude},${selectedProperty.longitude}`;
                    window.open(url, "_blank");
                  }}
                >
                  {selectedProperty.address}
                </span>
              </p>
              <p><strong>Type:</strong> {selectedProperty.type}</p>
              <p><strong>Furnishing:</strong> {selectedProperty.furnishing}</p>
              <p><strong>Tenant:</strong> {selectedProperty.tenantType}</p>
              <p><strong>Rent:</strong> ₹{selectedProperty.rent}</p>
              <p><strong>Contact:</strong> ₹{selectedProperty.contact}</p>
            </div>

            <button className="vp-modal-footer-close" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button onClick={handlePrev} disabled={currentPage === 1}>⬅ Prev</button>
        <span>Page {currentPage} of {totalPages || 1}</span>
        <button onClick={handleNext} disabled={currentPage === totalPages}>Next ➡</button>
      </div>
    </div>
  );
}
