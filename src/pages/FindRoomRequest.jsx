import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import "./OwnerRequest.css";
import axios from "axios";

export default function FindRoomRequest() {
  const [requests, setRequests] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const itemsPerPage = 10;

  // =========================
  // FETCH REQUESTS
  // =========================
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://roombuddy-api.onrender.com/api/find-room"
      );

      console.log("Find Room API:", res.data);

      if (Array.isArray(res.data)) {
        setRequests(res.data);
      } else if (Array.isArray(res.data.data)) {
        setRequests(res.data.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error(
        "Error fetching find room requests:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VIEW DETAILS
  // =========================
  const handleViewDetails = (data) => {
    setSelectedRequest(data);
    setShowModal(true);
  };

  // =========================
  // STATUS COUNTS
  // =========================
  const pendingCount = requests.filter(
    (r) =>
      r.status?.toLowerCase() === "pending"
  ).length;

  const confirmedCount = requests.filter(
    (r) =>
      r.status?.toLowerCase() === "confirmed"
  ).length;

  const completedCount = requests.filter(
    (r) =>
      r.status?.toLowerCase() === "completed"
  ).length;

  // =========================
  // EDIT STATUS
  // =========================
  const handleEdit = (
    id,
    currentStatus
  ) => {
    setEditingId(id);

    setEditedStatus(
      currentStatus || "Pending"
    );
  };

  // =========================
  // SAVE STATUS
  // =========================
  const handleSave = async (request) => {
    try {
      const res = await axios.put(
        `https://roombuddy-api.onrender.com/api/find-room/${request._id}/status`,
        {
          status: editedStatus,
        }
      );

      const updatedStatus =
        res.data?.data?.status ||
        editedStatus;

      setRequests((prev) =>
        prev.map((r) =>
          r._id === request._id
            ? {
                ...r,
                status: updatedStatus,
              }
            : r
        )
      );

      if (
        selectedRequest?._id ===
        request._id
      ) {
        setSelectedRequest((prev) => ({
          ...prev,
          status: updatedStatus,
        }));
      }

      setEditingId(null);
    } catch (err) {
      console.error(
        "Status update failed:",
        err
      );

      alert(
        "Failed to update status"
      );
    }
  };

  // =========================
  // SEARCH
  // =========================
  const filtered = requests.filter(
    (r) => {
      const searchText =
        search.toLowerCase();

      return (
        r.requestId
          ?.toLowerCase()
          .includes(searchText) ||

        r.phone
          ?.toLowerCase()
          .includes(searchText) ||

        r.preferredLocation
          ?.toLowerCase()
          .includes(searchText) ||

        r.roomType
          ?.toLowerCase()
          .includes(searchText) ||

        r.furnishing
          ?.toLowerCase()
          .includes(searchText) ||

        r.tenantType
          ?.toLowerCase()
          .includes(searchText) ||

        r.status
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  // =========================
  // PAGINATION
  // =========================
  const totalPages = Math.ceil(
    filtered.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const paginatedData =
    filtered.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  return (
    <div className="own-page">

      {/* =========================
          HERO
      ========================= */}
      <div className="own-hero">

        <div>
          <h2 className="own-title">
            ₹499 Slot Requests
          </h2>

          <p className="own-sub">
            Review, manage and track all customer room search requests.
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
            <RefreshCw
              size={16}
              className={
                loading
                  ? "lv-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <div className="own-hero-badge">
            {filtered.length} Total
          </div>

        </div>

      </div>

      {/* =========================
          SUMMARY
      ========================= */}
      <div className="own-summary">

        <div className="own-summary-card own-card-completed">
          <span className="own-dot" />

          <div>
            <h3>Completed</h3>
            <p>
              {completedCount}
            </p>
          </div>
        </div>

        <div className="own-summary-card own-card-approved">
          <span className="own-dot" />

          <div>
            <h3>Confirmed</h3>
            <p>
              {confirmedCount}
            </p>
          </div>
        </div>

        <div className="own-summary-card own-card-pending">
          <span className="own-dot" />

          <div>
            <h3>Pending</h3>
            <p>
              {pendingCount}
            </p>
          </div>
        </div>

      </div>

      {/* =========================
          SEARCH
      ========================= */}
      <div className="own-toolbar">

        <div className="own-search">

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <path
              d="m21 21-4.3-4.3"
            />
          </svg>

          <input
            type="text"
            placeholder="Search by Request ID, Phone, Location, Room Type…"
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );

              setCurrentPage(1);
            }}
          />

        </div>

      </div>

      {/* =========================
          TABLE
      ========================= */}
      <div className="own-table-wrap">

        <table className="own-table">

          <thead>
            <tr>
              <th>Request ID</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Visit Date</th>
              <th>Room Type</th>
              <th>Furnishing</th>
              <th>Tenant</th>
              <th>Budget</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan="10"
                  className="own-empty"
                >
                  Loading…
                </td>
              </tr>

            ) : paginatedData.length > 0 ? (

              paginatedData.map(
                (r) => (

                  <tr key={r._id}>

                    {/* REQUEST ID */}
                    <td
                      className="own-link"
                      onClick={() =>
                        handleViewDetails(
                          r
                        )
                      }
                    >
                      {r.requestId ||
                        "N/A"}
                    </td>

                    {/* PHONE */}
                    <td>
                      {r.phone ||
                        "N/A"}
                    </td>

                    {/* LOCATION */}
                    <td>
                      {r.preferredLocation ||
                        "N/A"}
                    </td>

                    {/* VISIT DATE */}
                    <td>
                           {r.visitDate
                      ? new Date(
                          r.visitDate
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"}
                    </td>

                    {/* ROOM TYPE */}
                    <td>
                      {r.roomType ||
                        "N/A"}
                    </td>

                    {/* FURNISHING */}
                    <td>
                      {r.furnishing ||
                        "N/A"}
                    </td>

                    {/* TENANT */}
                    <td>
                      {r.tenantType ||
                        "N/A"}
                    </td>

                    {/* BUDGET */}
                    <td className="own-rent">
                      ₹{" "}
                      {Number(
                        r.budgetMin ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                      {" - "}
                      ₹{" "}
                      {Number(
                        r.budgetMax ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    {/* STATUS */}
                    <td>

                      {editingId ===
                      r._id ? (

                        <select
                          className="own-status-select"
                          value={
                            editedStatus
                          }
                          onChange={(e) =>
                            setEditedStatus(
                              e.target
                                .value
                            )
                          }
                        >

                          <option value="Pending">
                            Pending
                          </option>

                          <option value="Confirmed">
                            Confirmed
                          </option>

                          <option value="Assigned">
                            Assigned
                          </option>

                          <option value="Completed">
                            Completed
                          </option>

                          <option value="Cancelled">
                            Cancelled
                          </option>

                        </select>

                      ) : (

                        <span
                          className={`own-badge own-badge-${(
                            r.status ||
                            "Pending"
                          ).toLowerCase()}`}
                        >
                          {r.status ||
                            "Pending"}
                        </span>

                      )}

                    </td>

                    {/* ACTION */}
                    <td>

                      {editingId ===
                      r._id ? (

                        <button
                          className="own-btn own-btn-save"
                          onClick={() =>
                            handleSave(
                              r
                            )
                          }
                        >
                          Save
                        </button>

                      ) : (

                        <button
                          className="own-btn own-btn-edit"
                          onClick={() =>
                            handleEdit(
                              r._id,
                              r.status
                            )
                          }
                        >
                          Edit
                        </button>

                      )}

                    </td>

                  </tr>

                )
              )

            ) : (

              <tr>
                <td
                  colSpan="10"
                  className="own-empty"
                >
                  No room requests found
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* =========================
          MODAL
      ========================= */}
      {showModal &&
        selectedRequest && (

          <div
            className="own-modal-overlay"
            onClick={() =>
              setShowModal(false)
            }
          >

            <div
              className="own-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* MODAL HEADER */}
              <div className="own-modal-head">

                <div>

                  <h3>
                    {
                      selectedRequest.requestId
                    }
                  </h3>

                  <span className="own-modal-sub">
                    {
                      selectedRequest.preferredLocation
                    }{" "}
                    ·{" "}
                    {
                      selectedRequest.roomType
                    }
                  </span>

                </div>

                <span
                  className={`own-badge own-badge-${(
                    selectedRequest.status ||
                    "Pending"
                  ).toLowerCase()}`}
                >
                  {
                    selectedRequest.status ||
                    "Pending"
                  }
                </span>

              </div>

              {/* DETAILS */}
              <div className="own-details-grid">

                <div>
                  <label>
                    Request ID
                  </label>

                  <span>
                    {
                      selectedRequest.requestId ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>
                    Phone
                  </label>

                  <span>
                    {
                      selectedRequest.phone ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>
                    Preferred Location
                  </label>

                  <span>
                    {
                      selectedRequest.preferredLocation ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>
                    Visit Date
                  </label>

                  <span>
                       {selectedRequest.visitDate
                      ? new Date(
                          selectedRequest.visitDate
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"}
                  </span>
                </div>

                <div>
                  <label>
                    Room Type
                  </label>

                  <span>
                    {
                      selectedRequest.roomType ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>
                    Furnishing
                  </label>

                  <span>
                    {
                      selectedRequest.furnishing ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>
                    Tenant Type
                  </label>

                  <span>
                    {
                      selectedRequest.tenantType ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>
                    Minimum Budget
                  </label>

                  <span>
                    ₹{" "}
                    {Number(
                      selectedRequest.budgetMin ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div>
                  <label>
                    Maximum Budget
                  </label>

                  <span>
                    ₹{" "}
                    {Number(
                      selectedRequest.budgetMax ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div>
                  <label>
                    Payment Amount
                  </label>

                  <span>
                    ₹{" "}
                    {Number(
                      selectedRequest.payment
                        ?.amount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div>
                  <label>
                    Payment Status
                  </label>

                  <span>
                    {
                      selectedRequest
                        .payment
                        ?.status ||
                      "Pending"
                    }
                  </span>
                </div>

                <div>
                  <label>
                    Order ID
                  </label>

                  <span>
                    {
                      selectedRequest
                        .payment
                        ?.orderId ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>
                    Payment ID
                  </label>

                  <span>
                    {
                      selectedRequest
                        .payment
                        ?.paymentId ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>
                    Assigned To
                  </label>

                  <span>
                    {
                      selectedRequest
                        .assignedTo ||
                      "Not Assigned"
                    }
                  </span>
                </div>

                <div>
                  <label>
                    Status
                  </label>

                  <span>
                    {
                      selectedRequest
                        .status ||
                      "Pending"
                    }
                  </span>
                </div>

                <div>
                  <label>
                    Remarks
                  </label>

                  <span>
                    {
                      selectedRequest
                        .remarks ||
                      "No remarks"
                    }
                  </span>
                </div>

                <div>
                  <label>
                    Created On
                  </label>

                  <span>
                    {selectedRequest.createdAt
                      ? new Date(
                          selectedRequest.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"}
                  </span>
                </div>

              </div>

              {/* MODAL FOOTER */}
              <div className="own-modal-foot">

                <button
                  className="own-btn own-btn-close"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>
        )}

      {/* =========================
          PAGINATION
      ========================= */}
      <div className="own-pagination">

        <button
          disabled={
            currentPage === 1
          }
          onClick={() =>
            setCurrentPage(
              currentPage - 1
            )
          }
        >
          ⬅ Prev
        </button>

        <span>
          Page{" "}
          {currentPage} of{" "}
          {totalPages || 1}
        </span>

        <button
          disabled={
            currentPage ===
              totalPages ||
            totalPages === 0
          }
          onClick={() =>
            setCurrentPage(
              currentPage + 1
            )
          }
        >
          Next ➡
        </button>

      </div>

    </div>
  );
}