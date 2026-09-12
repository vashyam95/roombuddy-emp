import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import "./ViewRequest.css";
import axios from "axios";

export default function ViewRequest() {
  const [visits, setVisits] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://roombuddy-api.onrender.com/api/visit-request");
      setVisits(res.data.data);
    } catch (err) {
      console.error("Error fetching visits:", err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = visits.filter(v => v.status === "pending").length;
  const completedCount = visits.filter(v => v.status === "completed").length;

  const handleEdit = (id, currentStatus) => {
    setEditingId(id);
    setEditedStatus(currentStatus);
  };

  const handleSave = async (visit) => {
    try {
      await axios.put(
        `https://roombuddy-api.onrender.com/api/visit-request/${visit._id}/status`,
        { status: editedStatus }
      );
      setVisits(prev =>
        prev.map(v => (v._id === visit._id ? { ...v, status: editedStatus } : v))
      );
      setEditingId(null);
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status");
    }
  };

  const filtered = visits.filter(v => {
    const building = v.property?.building?.toLowerCase() || "";
    const area = v.property?.area?.toLowerCase() || "";
    const visitId = v.visitId?.toLowerCase() || "";
    return (
      building.includes(search.toLowerCase()) ||
      area.includes(search.toLowerCase()) ||
      visitId.includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="vr-page">
      <div className="vr-header">
        <div>
          <h2 className="vr-title">Visit Requests</h2>
          <p className="vr-subtitle">
            Manage and track all property visit bookings
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
            onClick={fetchVisits}
            disabled={loading}
          >
             <RefreshCw size={16} className={loading ? "lv-spin" : ""} />
            Refresh
          </button>

          <span className="vr-badge">
            {visits.length} Total
          </span>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="vr-summary">
        <div className="vr-summary-card vr-card-completed">
          <span className="vr-summary-dot" />
          <div>
            <h3>Visit Completed</h3>
            <p>{completedCount}</p>
          </div>
        </div>
        <div className="vr-summary-card vr-card-pending">
          <span className="vr-summary-dot" />
          <div>
            <h3>Visit Pending</h3>
            <p>{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="vr-search-bar">
        <svg className="vr-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search by Visit ID, Building or Area..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* TABLE */}
      <div className="vr-table-container">
        <table>
          <thead>
            <tr>
              <th>Visit ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Slot</th>
              <th>Building</th>
              <th>Colony</th>
              <th>Area</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="12" className="vr-empty">Loading...</td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((v) => (
                <tr key={v._id}>
                  <td><span className="vr-chip">{v.visitId}</span></td>
                  <td className="vr-name">{v.name}</td>
                  <td>{v.phone}</td>
                  <td>{v.date}</td>
                  <td><span className="vr-slot">{v.slot}</span></td>
                  <td>{v.property?.building || "N/A"}</td>
                  <td>{v.property?.colony || "N/A"}</td>
                  <td>{v.property?.area || "N/A"}</td>
                  <td>
                    {editingId === v._id ? (
                      <select
                        className="vr-status-select"
                        value={editedStatus}
                        onChange={(e) => setEditedStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span className={`vr-status vr-status--${v.status}`} style={{ color: "black" }}>
                        {v.status}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === v._id ? (
                      <button className="save-btn" onClick={() => handleSave(v)}>Save</button>
                    ) : (
                      <button className="edit-btn" onClick={() => handleEdit(v._id, v.status)}>Edit</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="vr-empty">No visit requests found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="vr-pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
          ⬅ Prev
        </button>
        <span>Page {currentPage} of {totalPages || 1}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
          Next ➡
        </button>
      </div>
    </div>
  );
}
