import axios from "axios";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import "./OfflineCustomers.css";

const STATUS_OPTIONS = ["Pending", "Visited", "Completed", "Closed"];
const API = "https://roombuddy-api.onrender.com/api/offline-customers";

export default function OfflineCustomers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    name: "", mobile: "", roomType: "", tenantType: "", budget: "",
    locations: "", amount: "No", requestedDate: "", shiftingDate: "",
  });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [editedFeedback, setEditedFeedback] = useState("");
  const [editedAmount, setEditedAmount] = useState("No");
  const [editedLocations, setEditedLocations] = useState("");
  const [amountFilter, setAmountFilter] = useState("All");
  const [editedMobile, setEditedMobile] = useState("");
  const [editedBudget, setEditedBudget] = useState("");
  const [currentAssignedTo, setCurrentAssignedTo] = useState("");
  const [transferId, setTransferId] = useState(null);
  const [assignedTo, setAssignedTo] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "Name required";
    if (!/^\d{10}$/.test(form.mobile)) er.mobile = "Enter valid 10-digit mobile";
    if (!form.locations.trim()) er.locations = "Location required";
    if (!form.requestedDate) er.requestedDate = "Requested date required";
    if (!form.shiftingDate) er.shiftingDate = "Shifting date required";
    return er;
  };

  // ==========================================
  // TRANSFER LEAD
  // ==========================================

  const transferLead = async () => {

    if (!assignedTo) {
      alert("Select employee");
      return;
    }

    // Prevent transferring to same employee
    if (
      assignedTo === currentAssignedTo
    ) {
      alert(
        "This lead is already assigned to this employee."
      );
      return;
    }

    try {

      await axios.put(
        `${API}/${transferId}/transfer`,
        {
          assignedTo,
        }
      );

      await fetchCustomers();

      setTransferId(null);
      setAssignedTo("");
      setCurrentAssignedTo("");

      alert(
        "Lead transferred successfully"
      );

    } catch (err) {

      console.error(
        "Transfer lead error:",
        err
      );

      alert(
        err.response?.data?.message ||
        "Failed to transfer lead"
      );
    }
  };


  // ==========================================
  // UNASSIGN LEAD
  // ==========================================

  const unassignLead = async () => {

    if (!transferId) {
      return;
    }

    const confirmUnassign =
      window.confirm(
        "Are you sure you want to remove this employee from the lead?"
      );

    if (!confirmUnassign) {
      return;
    }

    try {

      await axios.put(
        `${API}/${transferId}/transfer`,
        {
          assignedTo: null,
        }
      );

      await fetchCustomers();

      setTransferId(null);
      setAssignedTo("");
      setCurrentAssignedTo("");

      alert(
        "Lead unassigned successfully"
      );

    } catch (err) {

      console.error(
        "Unassign lead error:",
        err
      );

      alert(
        err.response?.data?.message ||
        "Failed to unassign lead"
      );
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const er = validate();
    if (Object.keys(er).length) return setErrors(er);
    try {
      setSubmitting(true);
      await axios.post(API, form);
      fetchCustomers();
      setForm({ name: "", mobile: "", roomType: "", tenantType: "", budget: "", locations: "", amount: "No", requestedDate: "", shiftingDate: "" });
      setErrors({});
    } catch (err) { console.log(err); alert("Unable to save lead"); } finally { setSubmitting(false); }
  };

  const handleEdit = (c) => {
    setEditingId(c._id);
    setEditedStatus(c.status);
    setEditedFeedback(c.feedback || "");
    setEditedAmount(c.amount || "No");
    setEditedMobile(c.mobile || "");
    setEditedBudget(c.budget || "");
    setEditedLocations(c.locations || "");
  };

  const handleSave = async (id) => {
    if ((editedStatus === "Visited" || editedStatus === "Completed" || editedStatus === "Closed") && !editedFeedback.trim()) {
      alert("Feedback required"); return;
    }
    try {
      await axios.put(`${API}/${id}`, {
        status: editedStatus, feedback: editedFeedback, amount: editedAmount,
        mobile: editedMobile, budget: editedBudget, locations: editedLocations,
      });
      await fetchCustomers();
      setEditingId(null); setEditedStatus(""); setEditedFeedback("");
      setEditedAmount("No"); setEditedMobile(""); setEditedBudget(""); setEditedLocations("");
    } catch (err) { console.log(err); }
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.locations.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q);
    const matchesAmount = amountFilter === "All" ? true : c.amount === amountFilter;
    return matchesSearch && matchesAmount;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paged = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const counts = {
    total: customers.length,
    pending: customers.filter((c) => c.status === "Pending").length,
    visited: customers.filter((c) => c.status === "Visited").length,
    completed: customers.filter((c) => c.status === "Completed").length,
    closed: customers.filter((c) => c.status === "Closed").length,
  };
  const paidCount = customers.filter(c => c.amount === "Yes").length;
  const unpaidCount = customers.filter(c => c.amount === "No").length;

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API);

      const sortedCustomers = (res.data.data || []).sort((a, b) => {
        // Pending first
        if (a.status === "Pending" && b.status !== "Pending") return -1;
        if (a.status !== "Pending" && b.status === "Pending") return 1;

        // Then latest requested date first
        return new Date(b.requestedDate) - new Date(a.requestedDate);
      });

      setCustomers(sortedCustomers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="oc-wrap">
      {/* Hero */}
      <div className="oc-hero">
        <div className="oc-hero-text">
          <span className="oc-eyebrow">CRM · Lead Desk</span>
          <h1 className="oc-title">Offline Customers</h1>
          <p className="oc-subtitle">Capture walk-in / phone leads and track their entire journey</p>
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
            onClick={fetchCustomers}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "lv-spin" : ""} />
            Refresh
          </button>

          <div className="oc-hero-badge">
            <span className="oc-hero-num">{counts.total}</span>
            <span className="oc-hero-lbl">Total Leads</span>
          </div>
        </div>
      </div>

      {/* Status summary */}
      <div className="oc-summary">
        <div className="oc-summary-card oc-pending">
          <span className="oc-sc-icon">⏳</span>
          <div><span>Pending</span><p>{counts.pending}</p></div>
        </div>
        <div className="oc-summary-card oc-visited">
          <span className="oc-sc-icon">📍</span>
          <div><span>Visited</span><p>{counts.visited}</p></div>
        </div>
        <div className="oc-summary-card oc-completed">
          <span className="oc-sc-icon">✅</span>
          <div><span>Completed</span><p>{counts.completed}</p></div>
        </div>
        <div className="oc-summary-card oc-closed">
          <span className="oc-sc-icon">🔒</span>
          <div><span>Closed</span><p>{counts.closed}</p></div>
        </div>
        <div className="oc-summary-card oc-total">
          <span className="oc-sc-icon">👥</span>
          <div><span>All Leads</span><p>{counts.total}</p></div>
        </div>
      </div>

      {/* Form */}
      <form className="oc-form" onSubmit={handleSubmit}>
        <div className="oc-form-header">
          <h2 className="oc-form-title">Add New Lead</h2>
          <p className="oc-form-sub">Fill in customer details to create a new lead entry</p>
        </div>
        <div className="oc-form-grid">
          <div className="oc-field">
            <label>Customer Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
            {errors.name && <small className="oc-err">{errors.name}</small>}
          </div>
          <div className="oc-field">
            <label>Mobile Number</label>
            <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} />
            {errors.mobile && <small className="oc-err">{errors.mobile}</small>}
          </div>
          <div className="oc-field">
            <label>Room Type</label>
            <select name="roomType" value={form.roomType} onChange={handleChange}>
              <option value="">Select</option>
              <option value="1 RK">1 RK</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
            </select>
          </div>
          <div className="oc-field">
            <label>Tenant Type</label>
            <select name="tenantType" value={form.tenantType} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Family">Family</option>
              <option value="Male Bachelors">Male Bachelors</option>
              <option value="Female Bachelors">Female Bachelors</option>
            </select>
          </div>
          <div className="oc-field">
            <label>Budget Range</label>
            <input name="budget" value={form.budget} onChange={handleChange} placeholder="e.g. 10000 - 15000" />
          </div>
          <div className="oc-field">
            <label>Requested Locations</label>
            <input name="locations" value={form.locations} onChange={handleChange} placeholder="e.g. Kondapur, Gachibowli" />
            {errors.locations && <small className="oc-err">{errors.locations}</small>}
          </div>
          <div className="oc-field">
            <label>Amount Paid</label>
            <select name="amount" value={form.amount} onChange={handleChange}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="oc-field">
            <label>Requested Date</label>
            <input type="date" name="requestedDate" value={form.requestedDate} onChange={handleChange} />
            {errors.requestedDate && <small className="oc-err">{errors.requestedDate}</small>}
          </div>
          <div className="oc-field">
            <label>Shifting Date</label>
            <input type="date" name="shiftingDate" value={form.shiftingDate} onChange={handleChange} />
            {errors.shiftingDate && <small className="oc-err">{errors.shiftingDate}</small>}
          </div>
        </div>
        <button type="submit" className="oc-submit" disabled={submitting}>{submitting ? "Submitting..." : "＋ Submit Lead"}</button>
      </form>

      {/* Payment summary (filters) */}
      <div className="property-summary">
        <div
          className={`summary-card compled-card ${amountFilter === "All" ? "is-active" : ""}`}
          onClick={() => { setAmountFilter("All"); setCurrentPage(1); }}
          style={{ cursor: "pointer" }}
        >
          <span className="summary-dot" />
          <h3>All Customers</h3>
          <p>{customers.length}</p>
        </div>
        <div
          className={`summary-card open-card ${amountFilter === "Yes" ? "is-active" : ""}`}
          onClick={() => { setAmountFilter("Yes"); setCurrentPage(1); }}
          style={{ cursor: "pointer" }}
        >
          <span className="summary-dot" />
          <h3>Paid Customers</h3>
          <p>{paidCount}</p>
        </div>
        <div
          className={`summary-card closed-card ${amountFilter === "No" ? "is-active" : ""}`}
          onClick={() => { setAmountFilter("No"); setCurrentPage(1); }}
          style={{ cursor: "pointer" }}
        >
          <span className="summary-dot" />
          <h3>Unpaid Customers</h3>
          <p>{unpaidCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="oc-toolbar">
        <input
          className="oc-search"
          placeholder="🔍 Search by name, mobile, location, status..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Table */}
      <div className="oc-table-wrap">
        <table className="oc-table">
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Mobile</th>
              <th>Locations</th><th>Paid</th>
              <th>Status</th><th>Feedback</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paged.length ? paged.map((c, i) => (
              <tr key={c._id} onClick={() => setSelected(c)} className="oc-row">
                <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                <td className="oc-name">
                  <div className="oc-avatar">{c.name?.[0]?.toUpperCase() || "?"}</div>
                  <span>{c.name}</span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  {editingId === c._id ? (
                    <input value={editedMobile} maxLength={10} onChange={(e) => setEditedMobile(e.target.value)} />
                  ) : c.mobile}
                </td>

                <td onClick={(e) => e.stopPropagation()}>
                  {editingId === c._id ? (
                    <input
                      value={editedLocations}
                      onChange={(e) => setEditedLocations(e.target.value)}
                      placeholder="Enter locations"
                    />
                  ) : (
                    c.locations
                  )}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  {editingId === c._id ? (
                    <select value={editedAmount} onChange={(e) => setEditedAmount(e.target.value)}>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  ) : (
                    <span className={`oc-pill ${c.amount === "Yes" ? "oc-pill-paid" : "oc-pill-unpaid"}`}>{c.amount}</span>
                  )}
                </td>

                <td onClick={(e) => e.stopPropagation()}>
                  {editingId === c._id ? (
                    <select value={editedStatus} onChange={(e) => setEditedStatus(e.target.value)}>
                      {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span className={`oc-badge oc-${c.status.toLowerCase()}`}>{c.status}</span>
                  )}
                </td>
                <td onClick={(e) => e.stopPropagation()} className="oc-feedback-cell">
                  {editingId === c._id ? (
                    (editedStatus === "Visited" || editedStatus === "Completed" || editedStatus === "Closed") ? (
                      <input placeholder="Enter feedback" value={editedFeedback} onChange={(e) => setEditedFeedback(e.target.value)} />
                    ) : <span className="oc-muted">—</span>
                  ) : (
                    c.feedback ? <span title={c.feedback}>{c.feedback}</span> : <span className="oc-muted">—</span>
                  )}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  {editingId === c._id ? (
                    <button className="oc-btn oc-btn-save" onClick={() => handleSave(c._id)}>Save</button>
                  ) : (
                    <div className="oc-action-group">
                      <button className="oc-btn oc-btn-edit" onClick={() => handleEdit(c)}>Edit</button>
                      {c.assignedTo ? (
                        <button
                          className="oc-btn oc-btn-transfered"
                          onClick={() => {
                            setTransferId(c._id);
                            setAssignedTo(c.assignedTo);
                            setCurrentAssignedTo(c.assignedTo);
                          }}
                        >
                          {c.assignedTo}
                        </button>
                      ) : (
                        <button
                          className="oc-btn oc-btn-transfer"
                          onClick={() => {
                            setTransferId(c._id);
                            setAssignedTo("");
                            setCurrentAssignedTo("");
                          }}
                        >
                          Transfer
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="13" className="oc-empty">No leads yet. Add your first one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="oc-pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>⬅ Prev</button>
        <span>Page {currentPage} of {totalPages || 1}</span>
        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>Next ➡</button>
      </div>

      {/* Details Modal */}
      {selected && (
        <div className="oc-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="oc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="oc-modal-head">
              <div className="oc-modal-identity">
                <div className="oc-avatar oc-avatar-lg">{selected.name?.[0]?.toUpperCase() || "?"}</div>
                <div>
                  <h3>{selected.name}</h3>
                  <p>📞 {selected.mobile}</p>
                </div>
              </div>
              <span className={`oc-badge oc-${selected.status.toLowerCase()}`}>{selected.status}</span>
            </div>

            <div className="oc-details-grid">
              <div><label>Room Type</label><p>{selected.roomType || "—"}</p></div>
              <div><label>Tenant Type</label><p>{selected.tenantType || "—"}</p></div>
              <div><label>Budget</label><p>{selected.budget || "—"}</p></div>
              <div><label>Locations</label><p>{selected.locations}</p></div>
              <div><label>Amount Paid</label>
                <p><span className={`oc-pill ${selected.amount === "Yes" ? "oc-pill-paid" : "oc-pill-unpaid"}`}>{selected.amount}</span></p>
              </div>
              <div><label>Requested Date</label><p>{selected.requestedDate}</p></div>
              <div><label>Shifting Date</label><p>{selected.shiftingDate}</p></div>
              <div><label>Created</label><p>{new Date(selected.createdAt).toLocaleString()}</p></div>
              <div className="oc-details-wide">
                <label>Feedback</label>
                <p>{selected.feedback || "— No feedback yet —"}</p>
              </div>
            </div>
            <button className="oc-modal-close" onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferId && (
        <div className="oc-modal-backdrop">
          <div className="oc-modal oc-modal-sm">
            <h2 className="oc-transfer-title">Transfer Lead</h2>
            <div className="oc-current-assign">
              Currently Assigned To :
              <span className="oc-current-name">{currentAssignedTo || "Not Assigned"}</span>
            </div>
            <label className="oc-transfer-label">Assign to Employee</label>
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">Select Employee</option>
              <option>Vasanth Kumar</option>
              <option>Janakirami Reddy</option>
            </select>
            <div className="oc-transfer-actions">

              {/* UNASSIGN */}
              {currentAssignedTo && (
                <button
                  className="oc-btn oc-btn-cancel"
                  onClick={unassignLead}
                >
                  Unassign
                </button>
              )}

              {/* CANCEL */}
              <button
                className="oc-btn oc-btn-cancel"
                onClick={() => {
                  setTransferId(null);
                  setAssignedTo("");
                  setCurrentAssignedTo("");
                }}
              >
                Cancel
              </button>

              {/* TRANSFER */}
              <button
                className="oc-btn oc-btn-transfer"
                onClick={transferLead}
              >
                Transfer
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
