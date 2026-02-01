import { useState, useEffect } from "react";
import "./ViewProperty.css";
import axios from "axios";

export default function ViewRequest() {
    const [visits, setVisits] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editedStatus, setEditedStatus] = useState("");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        try {
            const res = await axios.get(
                "https://roombuddy-api.onrender.com/api/visit-request"
            );
            setVisits(res.data.data);
        } catch (err) {
            console.error("Error fetching visits:", err);
        }
    };

    // SUMMARY COUNTS
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
                prev.map(v =>
                    v._id === visit._id ? { ...v, status: editedStatus } : v
                )
            );

            setEditingId(null);
        } catch (err) {
            console.error("Status update failed:", err);
            alert("Failed to update status");
        }
    };

    // SEARCH
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


    // PAGINATION
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="view-property">
            <h2>View Visit Requests</h2>

            {/* SUMMARY */}
            <div className="property-summary">
                <div className="summary-card open-card">
                    <h3>Visit Completed</h3>
                    <p>{completedCount}</p>
                </div>
                <div className="summary-card closed-card">
                    <h3>Visit Pending</h3>
                    <p>{pendingCount}</p>
                </div>
            </div>

            {/* SEARCH */}
            <div className="search-bar">
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
            <div className="table-container">
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
                        {paginatedData.length > 0 ? (
                            paginatedData.map((v) => (
                                <tr key={v._id}>
                                    <td>{v.visitId}</td>
                                    <td>{v.name}</td>
                                    <td>{v.phone}</td>
                                    <td>{v.date}</td>
                                    <td>{v.slot}</td>
                                    <td>{v.property?.building || "N/A"}</td>
                                    <td>{v.property?.colony || "N/A"}</td>
                                    <td>{v.property?.area || "N/A"}</td>
                                    <td>
                                        {editingId === v._id ? (
                                            <select
                                                value={editedStatus}
                                                onChange={(e) => setEditedStatus(e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        ) : (
                                            <span className={`status-badge ${v.status}`} style={{ color: "black" }}>
                                                {v.status}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {editingId === v._id ? (
                                            <button
                                                className="save-btn"
                                                onClick={() => handleSave(v)}
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleEdit(v._id, v.status)}
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9">No visit requests found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    Next ➡
                </button>
            </div>
        </div>
    );
}
