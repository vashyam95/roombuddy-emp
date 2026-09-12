import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import "./OwnerRequest.css";
import axios from "axios";

export default function OwnerRequest() {
  const [requests, setRequests] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://roombuddy-api.onrender.com/api/owner-postings"
      );
      if (Array.isArray(res.data)) setRequests(res.data);
      else if (Array.isArray(res.data.data)) setRequests(res.data.data);
      else setRequests([]);
    } catch (err) {
      console.error("Error fetching owner postings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (data) => {
    setSelectedRequest(data);
    setShowModal(true);
  };

  const pendingCount = requests.filter((r) => r.status?.toLowerCase() === "pending").length;
  const approvedCount = requests.filter((r) => r.status?.toLowerCase() === "approved").length;
  const completedCount = requests.filter((r) => r.status?.toLowerCase() === "completed").length;

  const handleEdit = (id, currentStatus) => {
    setEditingId(id);
    setEditedStatus(currentStatus || "Pending");
  };

  const handleSave = async (request) => {
    try {
      await axios.put(
        `https://roombuddy-api.onrender.com/api/owner-postings/${request._id}/status`,
        { status: editedStatus }
      );
      setRequests((prev) =>
        prev.map((r) => (r._id === request._id ? { ...r, status: editedStatus } : r))
      );
      setEditingId(null);
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status");
    }
  };

  const filtered = requests.filter((r) => {
    return (
      r.area?.toLowerCase().includes(search.toLowerCase()) ||
      r.building?.toLowerCase().includes(search.toLowerCase()) ||
      r.type?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="own-page">
      {/* HERO */}
      <div className="own-hero">
        <div>
          <h2 className="own-title">Owner Property Requests</h2>
          <p className="own-sub">Review, approve and manage every owner-submitted listing.</p>
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
            onClick={fetchRequests}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "lv-spin" : ""} />
            Refresh
          </button>

          <div className="own-hero-badge">
            {filtered.length} Total
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="own-summary">
        <div className="own-summary-card own-card-completed">
          <span className="own-dot" />
          <div>
            <h3>Completed</h3>
            <p>{completedCount}</p>
          </div>
        </div>
        <div className="own-summary-card own-card-approved">
          <span className="own-dot" />
          <div>
            <h3>Approved</h3>
            <p>{approvedCount}</p>
          </div>
        </div>
        <div className="own-summary-card own-card-pending">
          <span className="own-dot" />
          <div>
            <h3>Pending</h3>
            <p>{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="own-toolbar">
        <div className="own-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by Area, Building, or Type…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="own-table-wrap">
        <table className="own-table">
          <thead>
            <tr>
              <th>Building</th>
              <th>Area</th>
              <th>Type</th>
              <th>Furnishing</th>
              <th>Rent</th>
              <th>Status</th>
              <th>Action</th>
              <th>Posted On</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="own-empty">Loading…</td></tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((r) => (
                <tr key={r._id}>
                  <td className="own-link" onClick={() => handleViewDetails(r)}>
                    {r.building}
                  </td>
                  <td>{r.area}</td>
                  <td>{r.type}</td>
                  <td>{r.furnishing}</td>
                  <td className="own-rent">₹ {r.rent}</td>
                  <td>
                    {editingId === r._id ? (
                      <select
                        className="own-status-select"
                        value={editedStatus}
                        onChange={(e) => setEditedStatus(e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <span className={`own-badge own-badge-${r.status?.toLowerCase()}`}>
                        {r.status}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === r._id ? (
                      <button className="own-btn own-btn-save" onClick={() => handleSave(r)}>Save</button>
                    ) : (
                      <button className="own-btn own-btn-edit" onClick={() => handleEdit(r._id, r.status)}>Edit</button>
                    )}
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="8" className="own-empty">No owner postings found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && selectedRequest && (
        <div className="own-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="own-modal" onClick={(e) => e.stopPropagation()}>
            <div className="own-modal-head">
              <div>
                <h3>{selectedRequest.building}</h3>
                <span className="own-modal-sub">{selectedRequest.area} · {selectedRequest.type}</span>
              </div>
              <span className={`own-badge own-badge-${selectedRequest.status?.toLowerCase()}`}>
                {selectedRequest.status}
              </span>
            </div>

            <div className="own-details-grid">
              <div><label>Building</label><span>{selectedRequest.building}</span></div>
              <div><label>Area</label><span>{selectedRequest.area}</span></div>
              <div><label>Type</label><span>{selectedRequest.type}</span></div>
              <div><label>Furnishing</label><span>{selectedRequest.furnishing}</span></div>
              <div><label>Tenant Type</label><span>{selectedRequest.tenantType}</span></div>
              <div><label>Bathrooms</label><span>{selectedRequest.bathrooms}</span></div>
              <div><label>Floor</label><span>{selectedRequest.floor}</span></div>
              <div><label>Flat No</label><span>{selectedRequest.flat}</span></div>
              <div><label>Pincode</label><span>{selectedRequest.pincode}</span></div>
              <div><label>Rent</label><span>₹ {selectedRequest.rent}</span></div>
              <div><label>Advance</label><span>{selectedRequest.advance}</span></div>
              <div><label>Contact No 1</label><span>{selectedRequest.contact}</span></div>
              <div><label>Contact No 2</label><span>{selectedRequest.altContact}</span></div>
              <div><label>Latitude</label><span>{selectedRequest.latitude}</span></div>
              <div><label>Longitude</label><span>{selectedRequest.longitude}</span></div>
              <div><label>Parking (Bike/Car)</label><span>{selectedRequest.parkingCombined}</span></div>
              <div><label>Geyser</label><span>{selectedRequest.geyser}</span></div>
              <div><label>Power Backup</label><span>{selectedRequest.powerBackup}</span></div>
              <div><label>Security</label><span>{selectedRequest.security}</span></div>
              <div><label>CCTV</label><span>{selectedRequest.cctv}</span></div>
            </div>

            {selectedRequest.images?.length > 0 && (
              <div className="own-images">
                <strong>Images</strong>
                <div className="own-images-row">
                  {selectedRequest.images.map((img, index) => (
                    <img key={index} src={img} alt="property" />
                  ))}
                </div>
              </div>
            )}

            <div className="own-modal-foot">
              <button className="own-btn own-btn-close" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="own-pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>⬅ Prev</button>
        <span>Page {currentPage} of {totalPages || 1}</span>
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}
