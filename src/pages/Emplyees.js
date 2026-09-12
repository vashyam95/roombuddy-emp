import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import "./Employees.css";
import axios from "axios";

export default function Emplyees() {
  const [requests, setRequests] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const itemsPerPage = 10;

  const employees = [
    { name: "Vasanth", mobile: "8247660251" },
    { name: "Ram", mobile: "6302018522" },
  ];

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
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeCount = (mobile) =>
    requests.filter(
      (item) => item.contact === mobile || item.altContact === mobile
    ).length;

  const handleViewDetails = (data) => {
    setSelectedRequest(data);
    setShowModal(true);
  };

  const handleEdit = (id, status) => {
    setEditingId(id);
    setEditedStatus(status || "Pending");
  };

  const handleSave = async (request) => {
    try {
      await axios.put(
        `https://roombuddy-api.onrender.com/api/owner-postings/${request._id}/status`,
        { status: editedStatus }
      );
      setRequests((prev) =>
        prev.map((item) =>
          item._id === request._id ? { ...item, status: editedStatus } : item
        )
      );
      setEditingId(null);
    } catch (error) {
      alert("Status update failed");
    }
  };

  let filtered = requests;

  if (selectedEmployee) {
    filtered = filtered.filter(
      (item) =>
        item.contact === selectedEmployee.mobile ||
        item.altContact === selectedEmployee.mobile
    );
  }

  if (selectedDate) {
    filtered = filtered.filter((item) => {
      let d = new Date(item.createdAt).toLocaleDateString();
      return d === selectedDate;
    });
  }

  filtered = filtered.filter((item) => {
    return (
      item.area?.toLowerCase().includes(search.toLowerCase()) ||
      item.building?.toLowerCase().includes(search.toLowerCase()) ||
      item.type?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  const getDateWiseCount = () => {
    if (!selectedEmployee) return [];
    let employeeData = requests.filter(
      (item) =>
        item.contact === selectedEmployee.mobile ||
        item.altContact === selectedEmployee.mobile
    );
    employeeData = employeeData.filter((item) => {
      let d = new Date(item.createdAt);
      return (
        d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
      );
    });
    let result = {};
    employeeData.forEach((item) => {
      let date = new Date(item.createdAt).toLocaleDateString();
      result[date] = (result[date] || 0) + 1;
    });
    return Object.entries(result);
  };

  return (
    <div className="emp-page">
      {/* HERO HEADER */}
      <div className="emp-header">
        <div>
          <h2 className="emp-title">Employees Property Report</h2>
          <p className="emp-subtitle">
            Track properties added by field executives
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
             className="lv-hero-btn"
            onClick={fetchRequests}
            disabled={loading}
          >
           <RefreshCw size={16} className={loading ? "lv-spin" : ""} />
            Refresh
          </button>

          <div className="emp-badge">
            {requests.length} Total
          </div>
        </div>
      </div>

      {/* EMPLOYEE CARDS */}
      <div className="emp-summary">
        <div
          className={`emp-card emp-card--all ${!selectedEmployee ? "is-active" : ""
            }`}
          onClick={() => setSelectedEmployee(null)}
        >
          <span className="emp-avatar">👥</span>
          <div>
            <h3>All</h3>
            <p>{requests.length}</p>
          </div>
        </div>

        {employees.map((emp) => {
          const active = selectedEmployee?.mobile === emp.mobile;
          return (
            <div
              key={emp.mobile}
              className={`emp-card ${active ? "is-active" : ""}`}
              onClick={() => {
                setSelectedEmployee(emp);
                setCurrentPage(1);
              }}
            >
              <span className="emp-avatar">
                {emp.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <h3>{emp.name}</h3>
                <p>{getEmployeeCount(emp.mobile)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPLOYEE REPORT */}
      {selectedEmployee && (
        <div className="emp-report">
          <div className="emp-report-head">
            <h3 className="emp-report-title">
              {selectedEmployee.name}'s Property Report
            </h3>
            <select
              className="emp-month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
                setSelectedDate(null);
              }}
            >
              <option value={0}>January</option>
              <option value={1}>February</option>
              <option value={2}>March</option>
              <option value={3}>April</option>
              <option value={4}>May</option>
              <option value={5}>June</option>
              <option value={6}>July</option>
              <option value={7}>August</option>
              <option value={8}>September</option>
              <option value={9}>October</option>
              <option value={10}>November</option>
              <option value={11}>December</option>
            </select>
          </div>

          <div className="emp-date-list">
            {getDateWiseCount().length > 0 ? (
              getDateWiseCount().map(([date, count]) => (
                <div
                  key={date}
                  className={`emp-date-card ${selectedDate === date ? "is-active" : ""
                    }`}
                  onClick={() => {
                    setSelectedDate(date);
                    setCurrentPage(1);
                  }}
                >
                  <span>📅 {date}</span>
                  <b>{count}</b>
                </div>
              ))
            ) : (
              <p className="emp-no-report">
                No properties uploaded this month
              </p>
            )}
          </div>

          {selectedDate && (
            <button
              className="emp-clear-date"
              onClick={() => setSelectedDate(null)}
            >
              ✕ Clear date filter ({selectedDate})
            </button>
          )}
        </div>
      )}

      {/* TABLE */}
      <div className="emp-table-wrap">
        <table className="emp-table">
          <thead>
            <tr>
              <th>Building</th>
              <th>Area</th>
              <th>Type</th>
              <th>Rent</th>
              <th>Employee</th>
              <th>Status</th>
              {/* <th>Action</th> */}
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="emp-empty">Loading...</td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((r) => (
                <tr key={r._id} className="emp-row">
                  <td
                    className="emp-building"
                    onClick={() => handleViewDetails(r)}
                  >
                    {r.building}
                  </td>
                  <td>{r.area}</td>
                  <td>
                    <span className="emp-chip">{r.type}</span>
                  </td>
                  <td className="emp-money">₹ {r.rent}</td>
                  <td>
                    {employees.find(
                      (e) =>
                        e.mobile === r.contact || e.mobile === r.altContact
                    )?.name || "-"}
                  </td>
                  <td>
                    {editingId === r._id ? (
                      <select
                        className="emp-select"
                        value={editedStatus}
                        onChange={(e) => setEditedStatus(e.target.value)}
                      >
                        <option>Pending</option>
                        <option>Approved</option>
                        <option>Completed</option>
                      </select>
                    ) : (
                      <span
                        className={`emp-status emp-status--${r.status?.toLowerCase()}`}
                      >
                        {r.status}
                      </span>
                    )}
                  </td>
                  {/* <td>
                    {editingId === r._id ? (
                      <button
                        className="emp-save"
                        onClick={() => handleSave(r)}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        className="emp-edit"
                        onClick={() => handleEdit(r._id, r.status)}
                      >
                        Edit
                      </button>
                    )}
                  </td> */}
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="emp-empty">No Properties Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PROPERTY DETAILS MODAL */}
      {showModal && selectedRequest && (
        <div
          className="emp-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className="emp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="emp-modal-header">
              <h3>Property Details</h3>
              <button
                className="emp-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="emp-details-grid">
              <div><span>Building</span><strong>{selectedRequest.building}</strong></div>
              <div><span>Area</span><strong>{selectedRequest.area}</strong></div>
              <div><span>Type</span><strong>{selectedRequest.type}</strong></div>
              <div><span>Rent</span><strong>₹ {selectedRequest.rent}</strong></div>
              <div><span>Contact</span><strong>{selectedRequest.contact}</strong></div>
              <div><span>Employee Number</span><strong>{selectedRequest.altContact}</strong></div>
            </div>

            {selectedRequest.images?.length > 0 && (
              <div className="emp-images-block">
                <strong>Images</strong>
                <div className="emp-images">
                  {selectedRequest.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt="property"
                      className="emp-image"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="emp-modal-footer">
              <button
                className="emp-modal-footer-close"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="emp-pagination">
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
