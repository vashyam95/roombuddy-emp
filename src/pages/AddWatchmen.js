import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import axios from "axios";
import "./AddWatchmen.css";

const dutyOptions = ["Security", "Cleaning", "Maintenance", "Housekeeping", "Cooking"];
const tagOptions = ["Verified", "Telugu", "Hindi", "Hindi/Telugu", "Skilled"];

export default function AddWatchmen() {
    const [errors, setErrors] = useState({});
    const [caretakers, setCaretakers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editedStatus, setEditedStatus] = useState("");
    const [hireRequests, setHireRequests] = useState([]);
    const [hireLoading, setHireLoading] = useState(true);
    const [hireEditingId, setHireEditingId] = useState(null);
    const [hireEditedStatus, setHireEditedStatus] = useState("");

    const [formData, setFormData] = useState({
        husbandName: "", wifeName: "", role: "", rating: "",
        experience: "", location: "", mobile: "", duties: [], tags: [],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.husbandName.trim()) newErrors.husbandName = "Husband name is required";
        if (!formData.wifeName.trim()) newErrors.wifeName = "Wife name is required";
        if (!formData.role) newErrors.role = "Please select a role";
        if (!formData.rating) newErrors.rating = "Please select a rating";
        if (!formData.experience) newErrors.experience = "Please select experience";
        if (!formData.location.trim()) newErrors.location = "Location is required";
        if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
        if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Enter valid mobile number";
        if (formData.duties.length === 0) newErrors.duties = "Select at least one duty";
        if (formData.tags.length === 0) newErrors.tags = "Select at least one tag";
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        try {
            const response = await fetch("https://roombuddy-api.onrender.com/api/caretakers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert("Caretaker Couple Saved Successfully!");
                setFormData({
                    husbandName: "", wifeName: "", role: "", rating: "",
                    experience: "", location: "", mobile: "", duties: [], tags: [],
                });
                setErrors({});
            } else {
                alert(data.message || "Failed to save caretaker");
            }
        } catch (error) {
            console.error(error);
            alert("Server error. Please try again.");
        }
    };

    const toggleSelection = (field, value) => {
        setFormData((prev) => {
            const updatedValues = prev[field].includes(value)
                ? prev[field].filter((item) => item !== value)
                : [...prev[field], value];
            return { ...prev, [field]: updatedValues };
        });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    useEffect(() => {
        fetchCaretakers();
        fetchHireRequests();
    }, []);

    const fetchHireRequests = async () => {
        try {
            setHireLoading(true);
            const res = await axios.get("https://roombuddy-api.onrender.com/api/caretaker-hire");
            setHireRequests(res.data || []);
        } catch (error) {
            console.error("Error fetching hire requests:", error);
        } finally {
            setHireLoading(false);
        }
    };

    const fetchCaretakers = async () => {
        try {
            setLoading(true);
            const res = await axios.get("https://roombuddy-api.onrender.com/api/caretakers");
            setCaretakers(res.data || []);
        } catch (error) {
            console.error("Error fetching caretakers:", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        await Promise.all([
            fetchCaretakers(),
            fetchHireRequests(),
        ]);
    };

    const handleHireEdit = (id, currentStatus) => {
        setHireEditingId(id);
        setHireEditedStatus(currentStatus || "Pending");
    };

    const handleHireStatusSave = async (item) => {
        try {
            await axios.put(
                `https://roombuddy-api.onrender.com/api/caretaker-hire/${item._id}/status`,
                { status: hireEditedStatus }
            );
            setHireRequests((prev) =>
                prev.map((r) => (r._id === item._id ? { ...r, status: hireEditedStatus } : r))
            );
            setHireEditingId(null);
        } catch (error) {
            alert("Status update failed");
        }
    };

    const handleEdit = (id, currentStatus) => {
        setEditingId(id);
        setEditedStatus(currentStatus || "Pending");
    };

    const handleSaveStatus = async (item) => {
        try {
            await axios.put(
                `https://roombuddy-api.onrender.com/api/caretakers/${item._id}/status`,
                { status: editedStatus }
            );
            setCaretakers((prev) =>
                prev.map((c) => (c._id === item._id ? { ...c, status: editedStatus } : c))
            );
            setEditingId(null);
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        }
    };

    const pendingCount = caretakers.filter((c) => c.status?.toLowerCase() === "pending").length;
    const approvedCount = caretakers.filter((c) => c.status?.toLowerCase() === "approved").length;
    const closedCount = caretakers.filter((c) => c.status?.toLowerCase() === "closed").length;

    return (
        <div className="aw-page">
            {/* HERO */}
            <div className="aw-header">
                <div>
                    <h2 className="aw-title">Add Caretaker Couple</h2>
                    <p className="aw-subtitle">
                        Onboard verified caretaker couples for properties
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
                        onClick={refreshData}
                        disabled={loading || hireLoading}
                    >
                        <RefreshCw size={16} className={loading ? "lv-spin" : ""} />
                        Refresh
                    </button>

                    <span className="aw-badge">
                        {caretakers.length} Caretakers
                    </span>
                </div>
            </div>

            {/* FORM */}
            <form className="aw-form" onSubmit={handleSubmit}>
                <div className="aw-grid">
                    <div className="aw-field">
                        <label>Husband Name</label>
                        <input name="husbandName" placeholder="Enter husband name"
                            value={formData.husbandName} onChange={handleChange} />
                        {errors.husbandName && <span className="error-text">{errors.husbandName}</span>}
                    </div>

                    <div className="aw-field">
                        <label>Wife Name</label>
                        <input name="wifeName" placeholder="Enter wife name"
                            value={formData.wifeName} onChange={handleChange} />
                        {errors.wifeName && <span className="error-text">{errors.wifeName}</span>}
                    </div>

                    <div className="aw-field">
                        <label>Role</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="">Select Role</option>
                            <option>Apartment Caretaker Couple</option>
                            <option>Villa Caretaker Couple</option>
                            <option>Society Caretaker Couple</option>
                        </select>
                        {errors.role && <span className="error-text">{errors.role}</span>}
                    </div>

                    <div className="aw-field">
                        <label>Rating</label>
                        <select name="rating" value={formData.rating} onChange={handleChange}>
                            <option value="">Select Rating</option>
                            {["1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0"].map(r => (
                                <option key={r}>{r}</option>
                            ))}
                        </select>
                        {errors.rating && <span className="error-text">{errors.rating}</span>}
                    </div>

                    <div className="aw-field">
                        <label>Experience</label>
                        <select name="experience" value={formData.experience} onChange={handleChange}>
                            <option value="">Select Experience</option>
                            {Array.from({ length: 10 }, (_, i) => `${i + 1} yrs`).map(y => (
                                <option key={y}>{y}</option>
                            ))}
                        </select>
                        {errors.experience && <span className="error-text">{errors.experience}</span>}
                    </div>

                    <div className="aw-field">
                        <label>Location</label>
                        <input name="location" placeholder="Enter location"
                            value={formData.location} onChange={handleChange} />
                        {errors.location && <span className="error-text">{errors.location}</span>}
                    </div>

                    <div className="aw-field aw-field-full">
                        <label>Mobile Number</label>
                        <input name="mobile" placeholder="10-digit mobile number"
                            value={formData.mobile} onChange={handleChange} />
                        {errors.mobile && <span className="error-text">{errors.mobile}</span>}
                    </div>
                </div>

                <div className="selection-section">
                    <h4 className="section-title">Duties</h4>
                    <div className="selection-grid">
                        {dutyOptions.map((duty) => (
                            <div key={duty}
                                className={`selection-card ${formData.duties.includes(duty) ? "active" : ""}`}
                                onClick={() => toggleSelection("duties", duty)}>
                                {duty}
                            </div>
                        ))}
                    </div>
                    {errors.duties && <span className="error-text">{errors.duties}</span>}
                </div>

                <div className="selection-section">
                    <h4 className="section-title">Tags</h4>
                    <div className="selection-grid">
                        {tagOptions.map((tag) => (
                            <div key={tag}
                                className={`selection-card ${formData.tags.includes(tag) ? "active" : ""}`}
                                onClick={() => toggleSelection("tags", tag)}>
                                {tag}
                            </div>
                        ))}
                    </div>
                    {errors.tags && <span className="error-text">{errors.tags}</span>}
                </div>

                <div className="aw-actions">
                    <button type="submit" className="aw-submit">Save Caretaker Couple</button>
                </div>
            </form>

            {/* LIST */}
            <div className="aw-section">
                <h2 className="aw-section-title">All Caretaker Couples</h2>
                <div className="property-summary">
                    <div className="summary-card open-card">
                        <span className="summary-dot"></span>
                        <h3>Approved</h3><p>{approvedCount}</p>
                    </div>
                    <div className="summary-card closed-card">
                        <span className="summary-dot"></span>
                        <h3>Pending</h3><p>{pendingCount}</p>
                    </div>
                    <div className="summary-card compled-card">
                        <span className="summary-dot"></span>
                        <h3>Closed</h3><p>{closedCount}</p>
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Husband Name</th><th>Wife Name</th><th>Role</th>
                                <th>Rating</th><th>Experience</th><th>Location</th>
                                <th>Mobile</th><th>Status</th><th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" className="aw-empty">Loading...</td></tr>
                            ) : caretakers.length > 0 ? (
                                caretakers.map((item) => (
                                    <tr key={item._id}>
                                        <td>{item.husbandName}</td>
                                        <td>{item.wifeName}</td>
                                        <td>{item.role}</td>
                                        <td><span className="aw-chip">★ {item.rating}</span></td>
                                        <td>{item.experience}</td>
                                        <td>{item.location}</td>
                                        <td>{item.mobile}</td>
                                        <td>
                                            {editingId === item._id ? (
                                                <select value={editedStatus}
                                                    className="vr-status-select"
                                                    onChange={(e) => setEditedStatus(e.target.value)}>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            ) : (
                                                <span className={`status-badge ${item.status?.toLowerCase()}`}>
                                                    {item.status}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {editingId === item._id ? (
                                                <button className="save-btn" onClick={() => handleSaveStatus(item)}>Save</button>
                                            ) : (
                                                <button className="edit-btn" onClick={() => handleEdit(item._id, item.status)}>Edit</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="9" className="aw-empty">No caretaker couples found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* HIRE REQUESTS */}
            <div className="aw-section">
                <h2 className="aw-section-title">Requested Caretaker Couples</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Husband Name</th><th>Wife Name</th><th>Role</th>
                                <th>Experience</th><th>Location</th><th>User Mobile</th>
                                <th>Status</th><th>Action</th><th>Requested On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hireLoading ? (
                                <tr><td colSpan="9" className="aw-empty">Loading...</td></tr>
                            ) : hireRequests.length > 0 ? (
                                hireRequests.map((item) => (
                                    <tr key={item._id}>
                                        <td>{item.husbandName}</td>
                                        <td>{item.wifeName}</td>
                                        <td>{item.role}</td>
                                        <td>{item.experience}</td>
                                        <td>{item.location}</td>
                                        <td>{item.userMobile}</td>
                                        <td>
                                            {hireEditingId === item._id ? (
                                                <select value={hireEditedStatus}
                                                    className="vr-status-select"
                                                    onChange={(e) => setHireEditedStatus(e.target.value)}>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            ) : (
                                                <span className={`status-badge ${item.status?.toLowerCase()}`}>
                                                    {item.status}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {hireEditingId === item._id ? (
                                                <button className="save-btn" onClick={() => handleHireStatusSave(item)}>Save</button>
                                            ) : (
                                                <button className="edit-btn" onClick={() => handleHireEdit(item._id, item.status)}>Edit</button>
                                            )}
                                        </td>
                                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="9" className="aw-empty">No Hire Requests Found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
