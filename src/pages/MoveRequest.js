import { useState, useEffect } from "react";
import "./ViewProperty.css";
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
                "https://roombuddy-api.onrender.com/api/move-request"
            );
            setRequests(res.data.data || []);
        } catch (err) {
            console.error("Error fetching move requests:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleViewDetails = async (moveId) => {
        try {
            const res = await axios.get(
                `https://roombuddy-api.onrender.com/api/move-request/${moveId}`
            );

            setSelectedRequest(res.data.data);
            setShowModal(true);
        } catch (err) {
            console.error("Error fetching move details:", err);
            alert("Failed to fetch move details");
        }
    };


    // SUMMARY COUNTS
    const pendingCount = requests.filter(
        (r) => r.status === "pending"
    ).length;

    const completedCount = requests.filter(
        (r) => r.status === "completed"
    ).length;

    // UPDATE STATUS
    const handleEdit = (id, currentStatus) => {
        setEditingId(id);
        setEditedStatus(currentStatus || "pending");
    };

    const handleSave = async (request) => {
        try {
            await axios.put(
                `https://roombuddy-api.onrender.com/api/move-request/${request._id}/status`,
                { status: editedStatus }
            );

            setRequests((prev) =>
                prev.map((r) =>
                    r._id === request._id ? { ...r, status: editedStatus } : r
                )
            );

            setEditingId(null);
        } catch (err) {
            console.error("Status update failed:", err);
            alert("Failed to update status");
        }
    };

    // SEARCH (moveId + location)
    const filtered = requests.filter((r) => {
        return (
            r.moveId?.toLowerCase().includes(search.toLowerCase()) ||
            r.currentLocation?.toLowerCase().includes(search.toLowerCase()) ||
            r.preferredLocation?.toLowerCase().includes(search.toLowerCase())
        );
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    return (
        <div className="view-property">
            <h2>All Move Requests</h2>

            {/* SUMMARY */}
            <div className="property-summary">
                <div className="summary-card open-card">
                    <h3>Move Request Completed</h3>
                    <p>{completedCount}</p>
                </div>

                <div className="summary-card closed-card">
                    <h3>Move Request Pending</h3>
                    <p>{pendingCount}</p>
                </div>
            </div>

            {/* SEARCH */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by Move ID or Location..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {/* TABLE */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Move ID</th>
                            <th>Current Location</th>
                            <th>Preferred Location</th>
                            <th>Distance (km)</th>
                            <th>Room Type</th>
                            <th>Move Date</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                            <th>Requested On</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="10">Loading...</td>
                            </tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((r) => (
                                <tr key={r._id}>
                                    <td
                                        style={{ color: "#007bff", cursor: "pointer", fontWeight: "600" }}
                                        onClick={() => handleViewDetails(r.moveId)}
                                    >
                                        {r.moveId}
                                    </td>
                                    <td>{r.currentLocation}</td>
                                    <td>{r.preferredLocation}</td>
                                    <td>{r.distanceKm}</td>
                                    <td>{r.roomType}</td>
                                    <td>{r.moveDate}</td>
                                    <td>₹ {r.totalAmount}</td>

                                    {/* STATUS */}
                                    <td>
                                        {editingId === (r._id || r.id) ? (
                                            <select
                                                value={editedStatus}
                                                onChange={(e) => setEditedStatus(e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        ) : (
                                            <span
                                                className={`status-badge ${r.status || "pending"}`}
                                                style={{ color: "black" }}
                                            >
                                                {r.status || "pending"}
                                            </span>
                                        )}
                                    </td>


                                    {/* ACTION */}
                                    <td>
                                        {editingId === r._id ? (
                                            <button
                                                className="save-btn"
                                                onClick={() => handleSave(r)}
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <button
                                                className="edit-btn"
                                                onClick={() =>
                                                    handleEdit(r._id, r.status)
                                                }
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>

                                    <td>
                                        {new Date(r.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10">
                                    No move requests found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && selectedRequest && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Move Request Details</h3>

                        <p><strong>Move ID:</strong> {selectedRequest.moveId}</p>
                        <p><strong>Phone:</strong> {selectedRequest.phone}</p>
                        <p><strong>Current Location:</strong> {selectedRequest.currentLocation}</p>
                        <p><strong>Preferred Location:</strong> {selectedRequest.preferredLocation}</p>
                        <p><strong>Distance:</strong> {selectedRequest.distanceKm} km</p>
                        <p><strong>Room Type:</strong> {selectedRequest.roomType}</p>
                        <p><strong>Vehicle Name:</strong> {selectedRequest.selectedVehicle?.name}</p>
                        <p><strong>Vehicle Capacity:</strong> {selectedRequest.selectedVehicle?.cap}</p>
                        <p><strong>Furnishing:</strong> {selectedRequest.furnishingType}</p>
                        <p><strong>Tenant Type:</strong> {selectedRequest.tenantType}</p>
                        <p><strong>Budget:</strong> {selectedRequest.budgetRange}</p>
                        <p><strong>Move Date:</strong> {selectedRequest.moveDate}</p>
                        <p><strong>Extra Cartons:</strong> {selectedRequest.extraCartons ? "Yes" : "No"}</p>
                        <p><strong>Video Tour:</strong> {selectedRequest.videoTour ? "Yes" : "No"}</p>
                        <p><strong>Total Amount:</strong> ₹ {selectedRequest.totalAmount}</p>
                        <p><strong>Status:</strong> {selectedRequest.status}</p>
                        <p><strong>Requested On:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>

                        <button
                            className="close-btn"
                            onClick={() => setShowModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* PAGINATION */}
            <div className="pagination">
                <button
                    disabled={currentPage === 1}
                    onClick={() =>
                        setCurrentPage(currentPage - 1)
                    }
                >
                    ⬅ Prev
                </button>

                <span>
                    Page {currentPage} of {totalPages || 1}
                </span>

                <button
                    disabled={
                        currentPage === totalPages ||
                        totalPages === 0
                    }
                    onClick={() =>
                        setCurrentPage(currentPage + 1)
                    }
                >
                    Next ➡
                </button>
            </div>
        </div>
    );
}
