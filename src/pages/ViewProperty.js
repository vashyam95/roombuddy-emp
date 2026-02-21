import { useState, useEffect } from "react";
import "./ViewProperty.css";
import axios from "axios";

export default function ViewProperty() {
  const [properties, setProperties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(true);

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

  const filteredProperties = properties.filter(
    (p) =>
      p.building.toLowerCase().includes(search.toLowerCase()) ||
      p.area.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredProperties.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="view-property">
      <h2>View Properties</h2>

      {/* Summary */}
      <div className="property-summary">
        <div className="summary-card open-card">
          <h3>Active Properties</h3>
          <p>{openCount}</p>
        </div>
        <div className="summary-card closed-card">
          <h3>Closed Properties</h3>
          <p>{closedCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Building or Area..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
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
              <th>Parking</th>
              <th>Power</th>
              <th>Geyser</th>
              <th>Security</th>
              <th>CCTV</th>
              <th>Bath</th>
              <th>Floor</th>
              <th>Flat</th>
              <th>Colony</th>
              <th>Area</th>
              <th>Pincode</th>
              <th>Rent</th>
              <th>Advance</th>
              <th>Contact</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="20">Loading...</td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((p) => (
                <tr key={p._id}>
                  <td>{p.address}</td>
                  <td>{p.building}</td>
                  <td>{p.type}</td>
                  <td>{p.furnishing}</td>
                  <td>{p.tenantType}</td>
                  <td>{p.parking}</td>
                  <td>{p.powerBackup}</td>
                  <td>{p.geyser}</td>
                  <td>{p.security}</td>
                  <td>{p.cctv}</td>
                  <td>{p.bathrooms}</td>
                  <td>{p.floor}</td>
                  <td>{p.flat}</td>
                  <td>{p.colony}</td>
                  <td>{p.area}</td>
                  <td>{p.pincode}</td>
                  <td>{p.rent}</td>
                  <td>{p.advance}</td>
                  <td>{p.contact}</td>
                  <td>
                    {editingId === p.id ? (
                      <div className="edit-actions">
                        <select
                          value={editedStatus}
                          onChange={(e) => setEditedStatus(e.target.value)}
                        >
                          <option value="Open">Open</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <button
                          className="save-btn"
                          onClick={() => handleSave(p)}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="action-display">
                        <span
                          className={`status-badge ${p.status === "Open" ? "open" : "closed"
                            }`}
                        >
                          {p.status}
                        </span>
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(p.id, p.status)}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="20">No properties found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="page-btn"
        >
          ⬅ Prev
        </button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="page-btn"
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}
