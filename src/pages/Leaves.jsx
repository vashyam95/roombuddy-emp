import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    Check,
    X,
    RefreshCw,
    FileText,
    Clock,
    User,
} from "lucide-react";
import "./Leaves.css";

const API = "https://roombuddy-api.onrender.com/api/leaves";

export default function Leaves() {
    const navigate = useNavigate();

    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all"); // all | pending | approved | rejected
    const [employeeFilter, setEmployeeFilter] = useState(null); // employee name or null
    const [search, setSearch] = useState("");
    const [actingId, setActingId] = useState(null);
    const [selected, setSelected] = useState(null);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const res = await axios.get(API, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLeaves(res.data.data);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to load leaves");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const updateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this leave?`)) return;
        try {
            setActingId(id);
            const token = localStorage.getItem("token");

            await axios.put(
                `${API}/${id}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setLeaves((prev) =>
                prev.map((l) => (l._id === id ? { ...l, status } : l))
            );
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to update leave");
        } finally {
            setActingId(null);
        }
    };

    const counts = useMemo(() => {
        const c = { all: leaves.length, pending: 0, approved: 0, rejected: 0 };
        leaves.forEach((l) => {
            const s = (l.status || "").toLowerCase();
            if (c[s] !== undefined) c[s] += 1;
        });
        return c;
    }, [leaves]);

    const filtered = useMemo(() => {
        return leaves.filter((l) => {
            const status = (l.status || "").toLowerCase();
            const matchStatus = statusFilter === "all" ? true : status === statusFilter;
            const matchEmp = employeeFilter
                ? (l.employeeName || "") === employeeFilter
                : true;
            const q = search.trim().toLowerCase();
            const matchSearch =
                !q ||
                (l.employeeName || "").toLowerCase().includes(q) ||
                (l.leaveType || "").toLowerCase().includes(q) ||
                (l.reason || "").toLowerCase().includes(q);
            return matchStatus && matchEmp && matchSearch;
        });
    }, [leaves, statusFilter, employeeFilter, search]);

    const formatDate = (d) => {
        if (!d) return "—";
        const date = new Date(d);
        if (Number.isNaN(date.getTime())) return d;
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (d) => {
        if (!d) return "—";
        const date = new Date(d);
        if (Number.isNaN(date.getTime())) return d;
        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const initials = (name) =>
        (name || "?")
            .split(" ")
            .map((s) => s[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

    return (
        <div className="lv-wrap">
            {/* Hero */}
            <div className="lv-hero">
                <div className="lv-hero-text">
                    <span className="lv-eyebrow">HR · Leave Desk</span>
                    <h1 className="lv-title">Leave Requests</h1>
                    <p className="lv-subtitle">
                        Review and manage all employee leave applications
                    </p>
                </div>
                <div className="lv-hero-actions">
                    
                    <button
                        className="lv-hero-btn"
                        onClick={fetchLeaves}
                        disabled={loading}
                        aria-label="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? "lv-spin" : ""} /> Refresh
                    </button>
                    <div className="lv-hero-badge">
                        <span className="lv-hero-num">{counts.all}</span>
                        <span className="lv-hero-lbl">Total Leaves</span>
                    </div>
                </div>
            </div>

            {/* Status summary */}
            <div className="lv-summary">
                <div
                    className={`lv-summary-card lv-sc-total ${statusFilter === "all" ? "is-active" : ""}`}
                    onClick={() => setStatusFilter("all")}
                >
                    <span className="lv-sc-icon">👥</span>
                    <div>
                        <span className="lv-sc-lbl">All Leaves</span>
                        <p>{counts.all}</p>
                    </div>
                </div>
                <div
                    className={`lv-summary-card lv-sc-pending ${statusFilter === "pending" ? "is-active" : ""}`}
                    onClick={() => setStatusFilter("pending")}
                >
                    <span className="lv-sc-icon">⏳</span>
                    <div>
                        <span className="lv-sc-lbl">Pending</span>
                        <p>{counts.pending}</p>
                    </div>
                </div>
                <div
                    className={`lv-summary-card lv-sc-approved ${statusFilter === "approved" ? "is-active" : ""}`}
                    onClick={() => setStatusFilter("approved")}
                >
                    <span className="lv-sc-icon">✅</span>
                    <div>
                        <span className="lv-sc-lbl">Approved</span>
                        <p>{counts.approved}</p>
                    </div>
                </div>
                <div
                    className={`lv-summary-card lv-sc-rejected ${statusFilter === "rejected" ? "is-active" : ""}`}
                    onClick={() => setStatusFilter("rejected")}
                >
                    <span className="lv-sc-icon">🚫</span>
                    <div>
                        <span className="lv-sc-lbl">Rejected</span>
                        <p>{counts.rejected}</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="lv-toolbar">
                <input
                    className="lv-search"
                    placeholder="🔍 Search by employee, leave type, or reason..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {employeeFilter && (
                    <div className="lv-focus-chip">
                        <User size={14} />
                        Viewing: {employeeFilter}
                        <button
                            onClick={() => setEmployeeFilter(null)}
                            aria-label="Clear employee filter"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="lv-table-wrap">
                <table className="lv-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Employee</th>
                            <th>Leave Type</th>
                            <th>Leave Date</th>
                            <th>Reason</th>
                            <th>Applied On</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && leaves.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="lv-empty">
                                    Loading leave requests…
                                </td>
                            </tr>
                        ) : filtered.length ? (
                            filtered.map((l, i) => {
                                const status = (l.status || "pending").toLowerCase();
                                const isPending = status === "pending";
                                const isActing = actingId === l._id;
                                return (
                                    <tr
                                        key={l._id}
                                        className="lv-row"
                                        onClick={() => setSelected(l)}
                                    >
                                        <td>{i + 1}</td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <div className="lv-name-cell">
                                                <div className="lv-avatar">
                                                    {initials(l.employeeName)}
                                                </div>
                                                <button
                                                    className="lv-name-btn"
                                                    onClick={() =>
                                                        setEmployeeFilter(l.employeeName || "Unknown")
                                                    }
                                                    title="Show only this employee"
                                                >
                                                    {l.employeeName || "Unknown"}
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="lv-type-pill">
                                                {l.leaveType || "—"}
                                            </span>
                                        </td>
                                        <td>{formatDate(l.leaveDate)}</td>
                                        <td className="lv-reason-cell" title={l.reason || ""}>
                                            {l.reason || <span className="lv-muted">—</span>}
                                        </td>
                                        <td>{formatDateTime(l.createdAt)}</td>
                                        <td>
                                            <span className={`lv-badge lv-badge-${status}`}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </span>
                                        </td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            {isPending ? (
                                                <div className="lv-action-group">
                                                    <button
                                                        className="lv-btn lv-btn-approve"
                                                        disabled={isActing}
                                                        onClick={() => updateStatus(l._id, "approved")}
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button
                                                        className="lv-btn lv-btn-reject"
                                                        disabled={isActing}
                                                        onClick={() => updateStatus(l._id, "rejected")}
                                                    >
                                                        <X size={14} /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="lv-muted">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className="lv-empty">
                                    No leave requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            {selected && (
                <div className="lv-modal-backdrop" onClick={() => setSelected(null)}>
                    <div className="lv-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="lv-modal-head">
                            <div className="lv-modal-identity">
                                <div className="lv-avatar lv-avatar-lg">
                                    {initials(selected.employeeName)}
                                </div>
                                <div>
                                    <h3>{selected.employeeName || "Unknown"}</h3>
                                    <p>
                                        <User size={12} style={{ verticalAlign: "middle" }} />{" "}
                                        {selected.employeeId?.slice?.(-6) || "—"}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`lv-badge lv-badge-${(selected.status || "pending").toLowerCase()}`}
                            >
                                {(selected.status || "pending").charAt(0).toUpperCase() +
                                    (selected.status || "pending").slice(1)}
                            </span>
                        </div>

                        <div className="lv-details-grid">
                            <div>
                                <label>Leave Type</label>
                                <p>{selected.leaveType || "—"}</p>
                            </div>
                            <div>
                                <label>
                                    <CalendarDays size={12} /> Leave Date
                                </label>
                                <p>{formatDate(selected.leaveDate)}</p>
                            </div>
                            <div>
                                <label>
                                    <Clock size={12} /> Applied On
                                </label>
                                <p>{formatDateTime(selected.createdAt)}</p>
                            </div>
                            <div>
                                <label>Employee ID</label>
                                <p>{selected.employeeId || "—"}</p>
                            </div>
                            <div className="lv-details-wide">
                                <label>
                                    <FileText size={12} /> Reason
                                </label>
                                <p>{selected.reason || "— No reason provided —"}</p>
                            </div>
                        </div>

                        {(selected.status || "pending").toLowerCase() === "pending" && (
                            <div
                                className="lv-action-group"
                                style={{ marginTop: 20, justifyContent: "flex-end" }}
                            >
                                <button
                                    className="lv-btn lv-btn-reject"
                                    disabled={actingId === selected._id}
                                    onClick={async () => {
                                        await updateStatus(selected._id, "rejected");
                                        setSelected((s) => (s ? { ...s, status: "rejected" } : s));
                                    }}
                                >
                                    <X size={14} /> Reject
                                </button>
                                <button
                                    className="lv-btn lv-btn-approve"
                                    disabled={actingId === selected._id}
                                    onClick={async () => {
                                        await updateStatus(selected._id, "approved");
                                        setSelected((s) => (s ? { ...s, status: "approved" } : s));
                                    }}
                                >
                                    <Check size={14} /> Approve
                                </button>
                            </div>
                        )}

                        <button
                            className="lv-modal-close"
                            onClick={() => setSelected(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
