import { useState, useEffect } from "react";
import "./ViewProperty.css";
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

    // ✅ FETCH OWNER POSTINGS
    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                "https://roombuddy-api.onrender.com/api/owner-postings"
            );

            console.log("API RESPONSE:", res.data);

            // If API directly returns array
            if (Array.isArray(res.data)) {
                setRequests(res.data);
            }
            // If API returns { data: [...] }
            else if (Array.isArray(res.data.data)) {
                setRequests(res.data.data);
            }
            else {
                setRequests([]);
            }

        } catch (err) {
            console.error("Error fetching owner postings:", err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ VIEW DETAILS (No separate API — using same data)
    const handleViewDetails = (data) => {
        setSelectedRequest(data);
        setShowModal(true);
    };

    // SUMMARY COUNTS
    const pendingCount = requests.filter(
        (r) => r.status?.toLowerCase() === "pending"
    ).length;

    const approvedCount = requests.filter(
        (r) => r.status?.toLowerCase() === "approved"
    ).length;

    // UPDATE STATUS
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

    // SEARCH (area + building + type)
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
        <div className="view-property">
            <h2>All Owner Property Requests</h2>

            {/* SUMMARY */}
            <div className="property-summary">
                <div className="summary-card open-card">
                    <h3>Approved</h3>
                    <p>{approvedCount}</p>
                </div>

                <div className="summary-card closed-card">
                    <h3>Pending</h3>
                    <p>{pendingCount}</p>
                </div>
            </div>

            {/* SEARCH */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by Area, Building, Type..."
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
                            <tr>
                                <td colSpan="8">Loading...</td>
                            </tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((r) => (
                                <tr key={r._id}>
                                    <td
                                        style={{ color: "#007bff", cursor: "pointer", fontWeight: "600" }}
                                        onClick={() => handleViewDetails(r)}
                                    >
                                        {r.building}
                                    </td>
                                    <td>{r.area}</td>
                                    <td>{r.type}</td>
                                    <td>{r.furnishing}</td>
                                    <td>₹ {r.rent}</td>

                                    {/* STATUS */}
                                    <td>
                                        {editingId === r._id ? (
                                            <select
                                                value={editedStatus}
                                                onChange={(e) => setEditedStatus(e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        ) : (
                                            <span className={`status-badge ${r.status?.toLowerCase()}`}>
                                                {r.status}
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
                                <td colSpan="8">
                                    No owner postings found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {showModal && selectedRequest && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Property Details</h3>

                        <p><strong>Building:</strong> {selectedRequest.building}</p>
                        <p><strong>Area:</strong> {selectedRequest.area}</p>
                        <p><strong>Type:</strong> {selectedRequest.type}</p>
                        <p><strong>Furnishing:</strong> {selectedRequest.furnishing}</p>
                        <p><strong>Tenant Type:</strong> {selectedRequest.tenantType}</p>
                        <p><strong>Bathrooms:</strong> {selectedRequest.bathrooms}</p>
                        <p><strong>Floor:</strong> {selectedRequest.floor}</p>
                        <p><strong>Flat No:</strong> {selectedRequest.flat}</p>
                         <p><strong>Pincode:</strong>{selectedRequest.pincode}</p>
                        <p><strong>Rent:</strong> ₹ {selectedRequest.rent}</p>
                        <p><strong>Advance:</strong> {selectedRequest.advance}</p>
                        <p><strong>Contact:</strong> {selectedRequest.contact}</p>
                        <p><strong>Parking (Bike/Car):</strong> {selectedRequest.parkingCombined}</p>
                        <p><strong>Power Backup:</strong> {selectedRequest.powerBackup}</p>
                        <p><strong>Security:</strong> {selectedRequest.security}</p>
                        <p><strong>CCTV:</strong> {selectedRequest.cctv}</p>

                        {/* Images */}
                        {selectedRequest.images?.length > 0 && (
                            <div style={{ marginTop: "10px" }}>
                                <strong>Images:</strong>
                                <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                                    {selectedRequest.images.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt="property"
                                            style={{ width: "80px", height: "80px", borderRadius: "6px" }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

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
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    ⬅ Prev
                </button>

                <span>
                    Page {currentPage} of {totalPages || 1}
                </span>

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