import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import "./MoveRequest.css";
import axios from "axios";

export default function MoveRequest() {
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
        `https://roombuddy-api.onrender.com/api/home-request`
      );
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      const normalizedData = data.map((r) => ({
        ...r,
        status:
          r.status === "cancel"
            ? "cancelled"
            : r.status === "complete"
              ? "completed"
              : r.status || "pending",
      }));
      setRequests(normalizedData);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, currentStatus) => {
    setEditingId(id);
    setEditedStatus(currentStatus || "pending");
  };

  const handleSave = async (request) => {
    try {
      await axios.put(
        `https://roombuddy-api.onrender.com/api/home-request/${request._id}/status`,
        { status: editedStatus }
      );
      setRequests((prev) =>
        prev.map((r) =>
          r._id === request._id ? { ...r, status: editedStatus } : r
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error("Status update failed:", err.response?.data || err.message);
      alert("Failed to update status");
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const completedCount = requests.filter((r) => r.status === "completed").length;

  const filtered = requests.filter((r) => {
    return (
      r.requestId?.toLowerCase().includes(search.toLowerCase()) ||
      r.currentLocation?.toLowerCase().includes(search.toLowerCase()) ||
      r.preferredLocation?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  return (
    <div className="mr-page">
      {/* HERO HEADER */}
      <div className="mr-header">
        <div>
          <h2 className="mr-title">All Move Requests</h2>
          <p className="mr-subtitle">
            Track, update and manage shifting requests
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
            onClick={fetchRequests}
            disabled={loading}
          >
          <RefreshCw size={16} className={loading ? "lv-spin" : ""} />
            Refresh
          </button>

          <div className="mr-badge">
            {requests.length} Total
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="mr-summary">
        <div className="mr-summary-card completed">
          <span className="mr-dot" />
          <div>
            <h3>Completed</h3>
            <p>{completedCount}</p>
          </div>
        </div>
        <div className="mr-summary-card pending">
          <span className="mr-dot" />
          <div>
            <h3>Pending</h3>
            <p>{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mr-search">
        <input
          type="text"
          placeholder="🔍  Search by Request ID or Location..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* TABLE */}
      <div className="mr-table-wrap">
        <table className="mr-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Current Location</th>
              <th>Preferred Location</th>
              <th>Room Type</th>
              <th>Shifting Date</th>
              <th>Budget</th>
              <th>Status</th>
              <th>Action</th>
              <th>Requested On</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="mr-empty">Loading...</td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((r) => (
                <tr
                  key={r._id}
                  className="mr-row"
                  onClick={() => {
                    setSelectedRequest(r);
                    setShowModal(true);
                  }}
                >
                  <td>
                    <span className="mr-chip">{r.requestId}</span>
                  </td>
                  <td>{r.currentLocation}</td>
                  <td>{r.preferredLocation}</td>
                  <td>{r.roomType}</td>
                  <td>{r.shiftingDate}</td>
                  <td className="mr-money">
                    ₹ {r.budgetMin} - {r.budgetMax}
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                    {editingId === r._id ? (
                      <select
                        className="mr-select"
                        value={editedStatus}
                        onChange={(e) => setEditedStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span className={`mr-status mr-status--${r.status}`}>
                        {r.status === "pending" && "Pending"}
                        {r.status === "confirmed" && "Confirmed"}
                        {r.status === "completed" && "Completed"}
                        {r.status === "cancelled" && "Cancelled"}
                      </span>
                    )}
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                    {editingId === r._id ? (
                      <button className="mr-save" onClick={() => handleSave(r)}>
                        Save
                      </button>
                    ) : (
                      <button
                        className="mr-edit"
                        onClick={() => handleEdit(r._id, r.status)}
                      >
                        Edit
                      </button>
                    )}
                  </td>

                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="mr-empty">No requests found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && selectedRequest && (
        <div className="mr-modal-overlay" onClick={closeModal}>
          <div className="mr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mr-modal-header">
              <h3>Request Details</h3>
              <button className="mr-modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="mr-details-grid">
              <div><span>Request ID</span><strong>{selectedRequest.requestId}</strong></div>
              <div><span>Phone</span><strong>{selectedRequest.phone}</strong></div>
              <div><span>Current Location</span><strong>{selectedRequest.currentLocation}</strong></div>
              <div><span>Preferred Location</span><strong>{selectedRequest.preferredLocation}</strong></div>
              <div><span>Room Type</span><strong>{selectedRequest.roomType}</strong></div>
              <div><span>Furnishing</span><strong>{selectedRequest.furnishing}</strong></div>
              <div><span>Tenant Type</span><strong>{selectedRequest.tenantType}</strong></div>
              <div><span>Budget</span><strong>₹ {selectedRequest.budgetMin} - {selectedRequest.budgetMax}</strong></div>
              <div><span>Shifting Date</span><strong>{selectedRequest.shiftingDate}</strong></div>
              <div><span>Status</span><strong className={`mr-status mr-status--${selectedRequest.status}`}>{selectedRequest.status}</strong></div>
              <div className="mr-details-full"><span>Requested On</span><strong>{new Date(selectedRequest.createdAt).toLocaleString()}</strong></div>
            </div>

            <div className="mr-modal-footer">
              <button className="mr-modal-footer-close" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="mr-pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ⬅ Prev
        </button>
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
