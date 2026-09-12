import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import "./EmployeePerformance.css";
import axios from "axios";

const initials = (name) =>
    name.split(" ").map((p) => p[0]).slice(0, 2).join("");

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const monthLabel = (m) => m;

const dateLabel = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

const inr = (amount = 0) =>
  `₹${Number(amount).toLocaleString("en-IN")}`;


export default function EmployeePerformance() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const [month, setMonth] = useState(MONTHS[0]);
    const [nameFilter, setNameFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [minPoints, setMinPoints] = useState("");
    const [maxPoints, setMaxPoints] = useState("");
    const [leaveFilter, setLeaveFilter] = useState(""); // "", "with", "without"

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMonth, setModalMonth] = useState(MONTHS[0]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                "https://roombuddy-api.onrender.com/api/employees/performance"
            );

            setEmployees(res.data.data);
        } catch (err) {
            console.error("Error fetching performance:", err);
        } finally {
            setLoading(false);
        }
    };

    const recordOf = (e, m) => e.monthly?.find((r) => r.month === m) || { points: 0, fine: 0, bonus: 0, leaveDates: [] };

    const rows = employees
        .map((e) => ({ ...e, m: recordOf(e, month) }))
        .filter((e) => {
            return (
                (!nameFilter || e.name?.toLowerCase().includes(nameFilter.toLowerCase())) &&
                (!roleFilter || e.role === roleFilter) &&
                (!minPoints || e.m.points >= Number(minPoints)) &&
                (!maxPoints || e.m.points <= Number(maxPoints)) &&
                (!leaveFilter ||
                    (leaveFilter === "with" ? e.m.leaveDates.length > 0 : e.m.leaveDates.length === 0))
            );
        });

    const totalPoints = rows.reduce((s, e) => s + e.m.points, 0);
    const totalFine = rows.reduce((s, e) => s + e.m.fine, 0);
    const totalBonus = rows.reduce((s, e) => s + e.m.bonus, 0);
    const totalLeaves = rows.reduce((s, e) => s + e.m.leaveDates.length, 0);

    const totalPages = Math.ceil(rows.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = rows.slice(startIndex, startIndex + itemsPerPage);

    const handlePrev = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

    const openEmployee = (e) => {
        setSelectedEmployee(e);
        setModalMonth(month);
        setShowModal(true);
    };

    const roles = [...new Set(employees.map((e) => e.role))];
    const modalRecord = selectedEmployee ? recordOf(selectedEmployee, modalMonth) : null;

    return (
        <div className="view-property">
            {/* Hero header */}
            <div className="vp-header">
                <div>
                    <h2 className="vp-title">Employee Performance</h2>
                    <p className="vp-subtitle">
                        Monthly points, fines, bonuses and leaves — click a name for full detail
                    </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button className="lv-hero-btn" onClick={fetchEmployees} disabled={loading}>
                        <RefreshCw size={16} className={loading ? "lv-spin" : ""} />
                        Refresh
                    </button>
                    <span className="vp-badge">{rows.length} Staff</span>
                </div>
            </div>

            {/* Month tabs */}
            <div className="ep-months">
                {MONTHS.map((m) => (
                    <button
                        key={m}
                        className={`ep-month-tab ${m === month ? "is-active" : ""}`}
                        onClick={() => { setMonth(m); setCurrentPage(1); }}
                    >
                        {monthLabel(m)}
                    </button>
                ))}
            </div>

            {/* Summary */}
            <div className="property-summary">
                <div className="summary-card points-card">
                    <span className="summary-dot" />
                    <h3>Total Points</h3>
                    <p>{totalPoints}</p>
                </div>
                <div className="summary-card bonus-card">
                    <span className="summary-dot" />
                    <h3>Total Bonus</h3>
                    <p>{inr(totalBonus)}</p>
                </div>
                <div className="summary-card fine-card">
                    <span className="summary-dot" />
                    <h3>Total Fine</h3>
                    <p>{inr(totalFine)}</p>
                </div>
                <div className="summary-card leave-card">
                    <span className="summary-dot" />
                    <h3>Total Leaves</h3>
                    <p>{totalLeaves}</p>
                </div>
            </div>

            {/* FILTERS */}
            <div className="filters-container">
                <input
                    type="text"
                    placeholder="🔍  Search Employee..."
                    value={nameFilter}
                    onChange={(e) => { setNameFilter(e.target.value); setCurrentPage(1); }}
                />

                <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
                    <option value="">All Roles</option>
                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>

                <select value={leaveFilter} onChange={(e) => { setLeaveFilter(e.target.value); setCurrentPage(1); }}>
                    <option value="">All Attendance</option>
                    <option value="with">With Leaves</option>
                    <option value="without">Full Attendance</option>
                </select>

                <input
                    type="number"
                    placeholder="Min Points"
                    value={minPoints}
                    onChange={(e) => { setMinPoints(e.target.value); setCurrentPage(1); }}
                />

                <input
                    type="number"
                    placeholder="Max Points"
                    value={maxPoints}
                    onChange={(e) => { setMaxPoints(e.target.value); setCurrentPage(1); }}
                />

                <button
                    className="clear-btn"
                    onClick={() => {
                        setNameFilter("");
                        setRoleFilter("");
                        setLeaveFilter("");
                        setMinPoints("");
                        setMaxPoints("");
                        setCurrentPage(1);
                    }}
                >
                    Clear
                </button>
            </div>

            {/* Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Role</th>
                            <th>Lifetime Points</th>
                            <th>Monthly Points</th>
                            <th>Fine</th>
                            <th>Bonus</th>
                            <th>Net</th>
                            <th>Leaves</th>
                            <th>Leave Dates</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr><td colSpan="20" className="vp-empty">Loading...</td></tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((e) => {
                                const net = e.m.bonus - e.m.fine;
                                return (
                                    <tr key={e._id}>
                                        <td className="clickable-address" onClick={() => openEmployee(e)}>
                                            <span className="ep-avatar">{initials(e.name)}</span>
                                            {e.name}
                                        </td>
                                        <td>{e.role}</td>
                                        <td><span className="vp-chip">{e.lifetimePoints} LTP</span></td>
                                        <td className="vp-money">{e.m.points}</td>
                                        <td className="ep-fine">{inr(e.m.fine)}</td>
                                        <td className="ep-bonus">{inr(e.m.bonus)}</td>
                                        <td className={net >= 0 ? "ep-bonus" : "ep-fine"}>{inr(net)}</td>
                                        <td>
                                            <span className={`vp-status ${e.m.leaveDates.length ? "vp-status--closed" : "vp-status--open"}`}>
                                                {e.m.leaveDates.length} days
                                            </span>
                                        </td>
                                        <td>
                                            {e.m.leaveDates.length ? (
                                                <div className="ep-datechips">
                                                    {e.m.leaveDates.map((d) => (
                                                        <span key={d} className="ep-datechip">{dateLabel(d)}</span>
                                                    ))}
                                                </div>
                                            ) : "—"}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="20" className="vp-empty">No employees found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {showModal && selectedEmployee && (
                <div className="property-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="property-modal" onClick={(ev) => ev.stopPropagation()}>
                        <div className="vp-modal-header">
                            <h2>Performance Details</h2>
                            <button className="vp-modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <div className="ep-profile">
                            <span className="ep-avatar ep-avatar--lg">{initials(selectedEmployee.name)}</span>
                            <div className="ep-profile__meta">
                                <h3>{selectedEmployee.name}</h3>
                                <p>{selectedEmployee.role}</p>
                            </div>
                            <div className="ep-lifetime">
                                <small>Lifetime Points</small>
                                <strong>{selectedEmployee.lifetimePoints}</strong>
                            </div>
                        </div>

                        <div className="ep-months ep-months--modal">
                            {MONTHS.map((m) => (
                                <button
                                    key={m}
                                    className={`ep-month-tab ${m === modalMonth ? "is-active" : ""}`}
                                    onClick={() => setModalMonth(m)}
                                >
                                    {monthLabel(m)}
                                </button>
                            ))}
                        </div>

                        <div className="ep-modal-stats">
                            <div className="ep-stat">
                                <small>Monthly Points</small>
                                <strong>{modalRecord.points}</strong>
                            </div>
                            <div className="ep-stat ep-stat--fine">
                                <small>Fine</small>
                                <strong>{inr(modalRecord.fine)}</strong>
                            </div>
                            <div className="ep-stat ep-stat--bonus">
                                <small>Bonus</small>
                                <strong>{inr(modalRecord.bonus)}</strong>
                            </div>
                            <div className="ep-stat">
                                <small>Net Impact</small>
                                <strong>{inr(modalRecord.bonus - modalRecord.fine)}</strong>
                            </div>
                        </div>

                        <div className="vp-details-grid">
                            <p><strong>Month:</strong> {monthLabel(modalMonth)}</p>
                            <p><strong>Total Leaves:</strong> {modalRecord.leaveDates.length} days</p>
                        </div>

                        <h4 className="ep-section-title">Leave Dates</h4>
                        {modalRecord.leaveDates.length ? (
                            <div className="ep-datechips ep-datechips--modal">
                                {modalRecord.leaveDates.map((d) => (
                                    <span key={d} className="ep-datechip">{dateLabel(d)}</span>
                                ))}
                            </div>
                        ) : (
                            <p className="vp-noimg">Full attendance — no leaves taken.</p>
                        )}

                        <h4 className="ep-section-title">Month-wise History</h4>
                        <div className="table-container ep-history-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Points</th>
                                        <th>Fine</th>
                                        <th>Bonus</th>
                                        <th>Leaves</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedEmployee.monthly.map((r) => (
                                        <tr key={r.month} className={r.month === modalMonth ? "ep-row--active" : ""}>
                                            <td>{monthLabel(r.month)}</td>
                                            <td className="vp-money">{r.points}</td>
                                            <td className="ep-fine">{inr(r.fine)}</td>
                                            <td className="ep-bonus">{inr(r.bonus)}</td>
                                            <td>{r.leaveDates.length}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button className="vp-modal-footer-close" onClick={() => setShowModal(false)}>Close</button>
                    </div>
                </div>
            )}

            {/* Pagination */}
            <div className="pagination">
                <button onClick={handlePrev} disabled={currentPage === 1}>⬅ Prev</button>
                <span>Page {currentPage} of {totalPages || 1}</span>
                <button onClick={handleNext} disabled={currentPage === totalPages || totalPages === 0}>Next ➡</button>
            </div>
        </div>
    );
}
