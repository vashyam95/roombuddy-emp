import { useState, useEffect } from "react";
import "./ViewProperty.css";
import axios from "axios";

export default function LocationRequest() {
    const [requests, setRequests] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editedStatus, setEditedStatus] = useState("");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const itemsPerPage = 10;

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                "https://roombuddy-api.onrender.com/api/location-requests"
            );
            setRequests(res.data.data || []);
        } catch (err) {
            console.error("Error fetching requests:", err);
        } finally {
            setLoading(false);
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
                `https://roombuddy-api.onrender.com/api/location-requests/${request._id}/status`,
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

    // SEARCH
    const filtered = requests.filter((r) => {
        return (
            r.name?.toLowerCase().includes(search.toLowerCase()) ||
            r.mobile?.toLowerCase().includes(search.toLowerCase()) ||
            r.preferredLocation?.toLowerCase().includes(search.toLowerCase()) ||
            r.homeType?.toLowerCase().includes(search.toLowerCase())
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
            <h2>All Location Requests</h2>

            {/* SUMMARY CARDS */}
            <div className="property-summary">
                <div className="summary-card open-card">
                    <h3>Request Completed</h3>
                    <p>{completedCount}</p>
                </div>

                <div className="summary-card closed-card">
                    <h3>Request Pending</h3>
                    <p>{pendingCount}</p>
                </div>
            </div>

            {/* SEARCH */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by Name, Mobile, Location..."
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
                            <th>Name</th>
                            <th>Mobile</th>
                            <th>Preferred Location</th>
                            <th>Home Type</th>
                            <th>Status</th>
                            <th>Action</th>
                            <th>Requested On</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7">Loading...</td>
                            </tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((r) => (
                                <tr key={r._id}>
                                    <td>{r.name}</td>
                                    <td>{r.mobile}</td>
                                    <td>{r.preferredLocation}</td>
                                    <td>{r.homeType}</td>

                                    {/* STATUS */}
                                    <td>
                                        {editingId === r._id ? (
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
                                <td colSpan="7">
                                    No location requests found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
