import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import "./OwnerRequest.css";
import axios from "axios";

export default function ShiftingRequest() {
  const [requests, setRequests] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [selectedReferralDetails, setSelectedReferralDetails] = useState(null);
  const [showReferralDetailsModal, setShowReferralDetailsModal] = useState(false);

  // =========================
  // SHIFT REFERRAL PAYOUTS
  // =========================
  const [eligibleReferrals, setEligibleReferrals] = useState([]);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralActionId, setReferralActionId] = useState(null);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutReference, setPayoutReference] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    fetchRequests();
    fetchEligibleReferrals();
  }, []);

  // =========================
  // FETCH SHIFTING REQUESTS
  // =========================
  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://roombuddy-api.onrender.com/api/book-shifting"
      );

      console.log("Shifting requests:", res.data);

      if (Array.isArray(res.data)) {
        setRequests(res.data);
      } else if (Array.isArray(res.data.data)) {
        setRequests(res.data.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error(
        "Error fetching shifting requests:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH ELIGIBLE SHIFT REFERRALS
  // =========================
  const fetchEligibleReferrals = async () => {
    try {
      setReferralLoading(true);

      const res = await axios.get(
        "https://roombuddy-api.onrender.com/api/shift-referral/payouts/all"
      );

      const referrals = Array.isArray(
        res.data?.data
      )
        ? res.data.data
        : [];

      const enriched = await Promise.all(
        referrals.map(async (referral) => {
          try {
            const profileRes =
              await axios.get(
                `https://roombuddy-api.onrender.com/api/shift-referral/profile/${referral.referrerPhone}`
              );

            return {
              ...referral,
              bankProfile:
                profileRes.data?.saved
                  ? profileRes.data.data
                  : null,
            };
          } catch (profileError) {
            console.error(
              "Referral bank profile fetch failed:",
              profileError
            );

            return {
              ...referral,
              bankProfile: null,
            };
          }
        })
      );

      setEligibleReferrals(
        enriched
      );

    } catch (err) {
      console.error(
        "Error fetching shift referrals:",
        err
      );

      setEligibleReferrals([]);

    } finally {
      setReferralLoading(false);
    }
  };

  // =========================
  // MOVE REFERRAL TO PAYOUT PENDING
  // =========================
  const markReferralPending = async (
    referral
  ) => {
    try {
      setReferralActionId(
        referral._id
      );

      await axios.put(
        `https://roombuddy-api.onrender.com/api/shift-referral/payouts/${referral._id}/pending`
      );

      /*
       * Do not remove the referral from the table.
       * Just change its displayed state locally.
       */
      setEligibleReferrals(
        (prev) =>
          prev.map((item) =>
            item._id === referral._id
              ? {
                ...item,
                status:
                  "PAYOUT_PENDING",
              }
              : item
          )
      );

      alert(
        "Referral marked as Not Paid"
      );

    } catch (err) {
      console.error(
        "Referral payout pending update failed:",
        err
      );

      alert(
        err.response?.data?.message ||
        "Failed to update payout status"
      );

    } finally {
      setReferralActionId(
        null
      );
    }
  };

  // =========================
  // OPEN MARK PAID MODAL
  // =========================
  const openMarkPaidModal = (referral) => {
    setSelectedReferral(referral);
    setPayoutReference("");
    setShowPayoutModal(true);
  };

  // =========================
  // MARK REFERRAL PAID
  // =========================
  const markReferralPaid = async () => {
    if (!selectedReferral) return;

    if (!payoutReference.trim()) {
      alert("Enter payout reference / UTR number");
      return;
    }

    try {
      setReferralActionId(selectedReferral._id);

      await axios.put(
        `https://roombuddy-api.onrender.com/api/shift-referral/payouts/${selectedReferral._id}/paid`,
        { payoutReference: payoutReference.trim() }
      );

      setShowPayoutModal(false);
      setSelectedReferral(null);
      setPayoutReference("");
      await fetchEligibleReferrals();
      alert("₹999 payout marked as paid");
    } catch (err) {
      console.error("Referral mark-paid failed:", err);
      alert(
        err.response?.data?.message ||
        "Failed to mark payout as paid"
      );
    } finally {
      setReferralActionId(null);
    }
  };

  // =========================
  // VIEW DETAILS
  // =========================
  const handleViewDetails = (data) => {
    setSelectedRequest(data);
    setShowModal(true);
  };

  const handleReferralViewDetails = (referral) => {
    setSelectedReferralDetails(referral);
    setShowReferralDetailsModal(true);
  };

  // =========================
  // COUNTS
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
  const handleEdit = (id, currentStatus) => {
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
      await axios.put(
        `https://roombuddy-api.onrender.com/api/book-shifting/${request._id}/status`,
        {
          status: editedStatus,
        }
      );

      setRequests((prev) =>
        prev.map((r) =>
          r._id === request._id
            ? {
              ...r,
              status: editedStatus,
            }
            : r
        )
      );

      // Update modal also if currently open
      if (
        selectedRequest?._id === request._id
      ) {
        setSelectedRequest((prev) => ({
          ...prev,
          status: editedStatus,
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
  const filtered = requests.filter((r) => {
    const searchText =
      search.toLowerCase();

    return (
      r.requestId
        ?.toLowerCase()
        .includes(searchText) ||

      r.phone
        ?.toLowerCase()
        .includes(searchText) ||

      r.currentLocation
        ?.toLowerCase()
        .includes(searchText) ||

      r.destinationLocation
        ?.toLowerCase()
        .includes(searchText) ||

      r.roomType
        ?.toLowerCase()
        .includes(searchText) ||

      r.vehicle
        ?.toLowerCase()
        .includes(searchText) ||

      r.status
        ?.toLowerCase()
        .includes(searchText)
    );
  });

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
            Shifting Requests
          </h2>

          <p className="own-sub">
            Review, manage and track every booked shifting request.
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
            onClick={() => {
              fetchRequests();
              fetchEligibleReferrals();
            }}
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
            <p>{completedCount}</p>
          </div>
        </div>

        <div className="own-summary-card own-card-approved">
          <span className="own-dot" />

          <div>
            <h3>Confirmed</h3>
            <p>{confirmedCount}</p>
          </div>
        </div>

        <div className="own-summary-card own-card-pending">
          <span className="own-dot" />

          <div>
            <h3>Pending</h3>
            <p>{pendingCount}</p>
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
            placeholder="Search by Request ID, Phone, Location or Vehicle…"
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
              <th>Shifting</th>
              <th>Room</th>
              <th>Vehicle</th>
              <th>From</th>
              <th>To</th>
              <th>Price</th>
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

              paginatedData.map((r) => (

                <tr key={r._id}>

                  {/* REQUEST ID */}
                  <td
                    className="own-link"
                    onClick={() =>
                      handleViewDetails(r)
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

                  {/* DATE */}
                  <td>
                    {r.shiftingDate ||
                      "N/A"}
                  </td>

                  {/* ROOM TYPE */}
                  <td>
                    {r.roomType ||
                      "N/A"}
                  </td>

                  {/* VEHICLE */}
                  <td>
                    {r.vehicle ||
                      "N/A"}
                  </td>

                  {/* FROM */}
                  <td>
                    {r.currentLocation ||
                      "N/A"}
                  </td>

                  {/* TO */}
                  <td>
                    {r.destinationLocation ||
                      "N/A"}
                  </td>

                  {/* PRICE */}
                  <td className="own-rent">
                    ₹{" "}
                    {Number(
                      r.estimatedPrice || 0
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
                            e.target.value
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
                          handleSave(r)
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

              ))

            ) : (

              <tr>
                <td
                  colSpan="10"
                  className="own-empty"
                >
                  No shifting requests found
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
                      selectedRequest.roomType
                    }{" "}
                    ·{" "}
                    {
                      selectedRequest.vehicle
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
                  <label>Request ID</label>
                  <span>
                    {
                      selectedRequest.requestId ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>Phone</label>
                  <span>
                    {
                      selectedRequest.phone ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>Shifting Date</label>
                  <span>
                    {
                      selectedRequest.shiftingDate ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>Room Type</label>
                  <span>
                    {
                      selectedRequest.roomType ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>Vehicle</label>
                  <span>
                    {
                      selectedRequest.vehicle ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>Distance</label>
                  <span>
                    {
                      selectedRequest.distance ||
                      0
                    }{" "}
                    km
                  </span>
                </div>

                <div>
                  <label>Current Location</label>
                  <span>
                    {
                      selectedRequest.currentLocation ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>Destination</label>
                  <span>
                    {
                      selectedRequest.destinationLocation ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>Estimated Price</label>
                  <span>
                    ₹{" "}
                    {Number(
                      selectedRequest.estimatedPrice ||
                      0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div>
                  <label>Payment Amount</label>
                  <span>
                    ₹{" "}
                    {Number(
                      selectedRequest.payment?.amount ||
                      0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div>
                  <label>Payment Status</label>
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
                  <label>Current Floor</label>
                  <span>
                    {
                      selectedRequest.currentFloor ??
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>New Floor</label>
                  <span>
                    {
                      selectedRequest.newFloor ??
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>Current Lift</label>
                  <span>
                    {
                      selectedRequest.currentLift ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>New Lift</label>
                  <span>
                    {
                      selectedRequest.newLift ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>Assigned To</label>
                  <span>
                    {
                      selectedRequest.assignedTo ||
                      "Not Assigned"
                    }
                  </span>
                </div>

                <div>
                  <label>Status</label>
                  <span>
                    {
                      selectedRequest.status ||
                      "Pending"
                    }
                  </span>
                </div>

                <div>
                  <label>Order ID</label>
                  <span>
                    {
                      selectedRequest.payment
                        ?.orderId ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>Payment ID</label>
                  <span>
                    {
                      selectedRequest.payment
                        ?.paymentId ||
                      "-"
                    }
                  </span>
                </div>

                <div>
                  <label>Remarks</label>
                  <span>
                    {
                      selectedRequest.remarks ||
                      "No remarks"
                    }
                  </span>
                </div>

              </div>

              {/* APPLIANCES */}
              {selectedRequest.appliances
                ?.length > 0 && (

                  <div className="own-images">

                    <strong>
                      Appliances
                    </strong>

                    <div
                      className="own-images-row"
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",
                        gap: "8px",
                        marginTop:
                          "12px",
                      }}
                    >

                      {selectedRequest.appliances.map(
                        (item, index) => (

                          <div
                            key={
                              item._id ||
                              index
                            }
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              padding:
                                "10px 12px",
                              border:
                                "1px solid #e5e7eb",
                              borderRadius:
                                "8px",
                            }}
                          >

                            <strong>
                              {item.label}
                            </strong>

                            <span>

                              {item.uninstall &&
                                "Uninstall"}

                              {item.uninstall &&
                                item.install &&
                                " / "}

                              {item.install &&
                                "Install"}

                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

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
          SHIFT REFERRAL PAYOUTS
      ========================= */}
      <section style={{ marginTop: "24px" }}>
        <div className="own-hero" style={{ marginBottom: "16px" }}>
          <div>
            <h2 className="own-title">Shift Referral Payouts</h2>
            <p className="own-sub">
              ₹999 rewards eligible after the referred customer&apos;s shifting is completed.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="lv-hero-btn"
              onClick={fetchEligibleReferrals}
              disabled={referralLoading}
            >
              <RefreshCw size={16} className={referralLoading ? "lv-spin" : ""} />
              Refresh
            </button>
            <div className="own-hero-badge">
              {eligibleReferrals.length} Eligible
            </div>
          </div>
        </div>

        <div className="own-table-wrap">
          <table className="own-table">
            <thead>
              <tr>
                <th>Friend</th>
                <th>Friend Phone</th>
                <th>Referrer</th>
                <th>Shift Booking</th>
                <th>Completed</th>
                <th>Bank</th>
                <th>Reward</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {referralLoading ? (
                <tr><td colSpan="9" className="own-empty">Loading eligible referrals…</td></tr>
              ) : eligibleReferrals.length > 0 ? (
                eligibleReferrals.map((referral) => (
                  <tr key={referral._id}>
                    <td>{referral.referredName || "N/A"}</td>
                    <td>{referral.referredPhone || "N/A"}</td>
                    <td>{referral.referrerPhone || "N/A"}</td>
                    <td
                      className="own-link"
                      onClick={() =>
                        handleReferralViewDetails(referral)
                      }
                    >
                      {referral.shiftingBookingId || "N/A"}
                    </td>
                    <td>{referral.shiftingCompletedAt ? new Date(referral.shiftingCompletedAt).toLocaleString("en-IN") : "N/A"}</td>
                    <td>{referral.bankProfile ? `${referral.bankProfile.bankName || "Bank"} · ${referral.bankProfile.ifsc || ""}` : "Not saved"}</td>
                    <td className="own-rent">₹999</td>
                    <td>
                      <span
                        className={`own-badge ${referral.status === "PAID"
                          ? "own-badge-completed"
                          : "own-badge-pending"
                          }`}
                      >
                        {referral.status === "PAID"
                          ? "Paid"
                          : "Not Paid"}
                      </span>
                    </td>
                    <td>
                      {referral.status === "PAID" ? (
                        <button
                          className="own-btn own-btn-save"
                          disabled
                        >
                          Paid
                        </button>
                      ) : (
                        <button
                          className="own-btn own-btn-edit"
                          disabled={
                            referralActionId ===
                            referral._id
                          }
                          onClick={() => {
                            if (
                              referral.status ===
                              "SHIFTING_COMPLETED"
                            ) {
                              markReferralPending(
                                referral
                              );
                            } else if (
                              referral.status ===
                              "PAYOUT_PENDING"
                            ) {
                              openMarkPaidModal(
                                referral
                              );
                            }
                          }}
                        >
                          {referralActionId ===
                            referral._id
                            ? "Updating…"
                            : "Edit"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" className="own-empty">No ₹999 referrals are currently eligible.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "12px", padding: "12px 14px", border: "1px solid #e5e7eb", borderRadius: "10px", background: "#fff", fontSize: "13px", color: "#4b5563" }}>
          ₹999 becomes eligible only after the referred customer&apos;s shifting status is <strong>Completed</strong>. Payout Pending means the payout is being processed; it does not mean the payment has already been made.
        </div>
      </section>

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
          Page {currentPage} of{" "}
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

      {/* =========================
          MARK PAID MODAL
      ========================= */}
      {showPayoutModal && selectedReferral && (
        <div className="own-modal-overlay" onClick={() => setShowPayoutModal(false)}>
          <div className="own-modal" onClick={(e) => e.stopPropagation()}>
            <div className="own-modal-head">
              <div>
                <h3>Mark ₹999 as Paid</h3>
                <span className="own-modal-sub">
                  {selectedReferral.referredName || "Friend"} · {selectedReferral.referredPhone || "N/A"}
                </span>
              </div>
              <span className="own-badge own-badge-completed">₹999</span>
            </div>

            <div className="rb-form" style={{ marginTop: "16px" }}>
              <label className="rb-f">
                <span>Payout reference / UTR number</span>
                <input
                  value={payoutReference}
                  onChange={(e) => setPayoutReference(e.target.value)}
                  placeholder="Enter UTR / payment reference"
                  autoFocus
                />
              </label>
            </div>

            <div className="own-modal-foot">
              <button className="own-btn own-btn-close" onClick={() => setShowPayoutModal(false)}>Cancel</button>
              <button className="own-btn own-btn-save" disabled={referralActionId === selectedReferral._id} onClick={markReferralPaid}>
                {referralActionId === selectedReferral._id ? "Saving…" : "Mark Paid"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* =====================================================
    SHIFT REFERRAL DETAILS MODAL
===================================================== */}

{showReferralDetailsModal &&
  selectedReferralDetails && (

    <div
      className="own-modal-overlay"
      onClick={() =>
        setShowReferralDetailsModal(false)
      }
    >

      <div
        className="own-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* =========================
            MODAL HEADER
        ========================= */}

        <div className="own-modal-head">

          <div>

            <h3>
              Shift Referral Details
            </h3>

            <span className="own-modal-sub">
              {selectedReferralDetails.referredName ||
                "Friend"}
              {" · "}
              {selectedReferralDetails.referredPhone ||
                "N/A"}
            </span>

          </div>


          <span
            className={`own-badge ${
              selectedReferralDetails.status ===
              "PAID"
                ? "own-badge-completed"
                : "own-badge-pending"
            }`}
          >
            {selectedReferralDetails.status ===
            "PAID"
              ? "Paid"
              : "Not Paid"}
          </span>

        </div>


        {/* =========================
            REFERRAL DETAILS
        ========================= */}

        <div className="own-details-grid">

          <div>
            <label>
              Referral ID
            </label>

            <span>
              {selectedReferralDetails._id ||
                "-"}
            </span>
          </div>


          <div>
            <label>
              Friend Name
            </label>

            <span>
              {selectedReferralDetails.referredName ||
                "-"}
            </span>
          </div>


          <div>
            <label>
              Friend Phone
            </label>

            <span>
              {selectedReferralDetails.referredPhone ||
                "-"}
            </span>
          </div>


          <div>
            <label>
              Referrer Phone
            </label>

            <span>
              {selectedReferralDetails.referrerPhone ||
                "-"}
            </span>
          </div>


          <div>
            <label>
              Referral Status
            </label>

            <span>
              {selectedReferralDetails.status ||
                "-"}
            </span>
          </div>


          <div>
            <label>
              Reward Amount
            </label>

            <span>
              ₹
              {Number(
                selectedReferralDetails.rewardAmount ||
                  999
              ).toLocaleString("en-IN")}
            </span>
          </div>


          <div>
            <label>
              Shifting Booking ID
            </label>

            <span>
              {selectedReferralDetails.shiftingBookingId ||
                "-"}
            </span>
          </div>


          <div>
            <label>
              Invited At
            </label>

            <span>
              {selectedReferralDetails.invitedAt
                ? new Date(
                    selectedReferralDetails.invitedAt
                  ).toLocaleString("en-IN")
                : "-"}
            </span>
          </div>


          <div>
            <label>
              Registered At
            </label>

            <span>
              {selectedReferralDetails.registeredAt
                ? new Date(
                    selectedReferralDetails.registeredAt
                  ).toLocaleString("en-IN")
                : "-"}
            </span>
          </div>


          <div>
            <label>
              Shifting Booked At
            </label>

            <span>
              {selectedReferralDetails.shiftingBookedAt
                ? new Date(
                    selectedReferralDetails.shiftingBookedAt
                  ).toLocaleString("en-IN")
                : "-"}
            </span>
          </div>


          <div>
            <label>
              Shifting Completed At
            </label>

            <span>
              {selectedReferralDetails.shiftingCompletedAt
                ? new Date(
                    selectedReferralDetails.shiftingCompletedAt
                  ).toLocaleString("en-IN")
                : "-"}
            </span>
          </div>


          <div>
            <label>
              Payout Pending At
            </label>

            <span>
              {selectedReferralDetails.payoutPendingAt
                ? new Date(
                    selectedReferralDetails.payoutPendingAt
                  ).toLocaleString("en-IN")
                : "-"}
            </span>
          </div>


          <div>
            <label>
              Paid At
            </label>

            <span>
              {selectedReferralDetails.paidAt
                ? new Date(
                    selectedReferralDetails.paidAt
                  ).toLocaleString("en-IN")
                : "-"}
            </span>
          </div>


          <div>
            <label>
              Payout Reference / UTR
            </label>

            <span>
              {selectedReferralDetails.payoutReference ||
                "-"}
            </span>
          </div>


          <div>
            <label>
              Payout Failure Reason
            </label>

            <span>
              {selectedReferralDetails.payoutFailureReason ||
                "-"}
            </span>
          </div>


          {/* =========================
              BANK DETAILS
          ========================= */}

          <div>
            <label>
              Bank Name
            </label>

            <span>
              {selectedReferralDetails.bankProfile
                ?.bankName ||
                "Not saved"}
            </span>
          </div>


          <div>
            <label>
              Account Number
            </label>

            <span>
              {selectedReferralDetails.bankProfile
                ?.accountNumber ||
                "Not saved"}
            </span>
          </div>


          <div>
            <label>
              IFSC Code
            </label>

            <span>
              {selectedReferralDetails.bankProfile
                ?.ifsc ||
                "Not saved"}
            </span>
          </div>


          <div>
            <label>
              Account Holder Name
            </label>

            <span>
              {selectedReferralDetails.bankProfile
                ?.name ||
                "Not saved"}
            </span>
          </div>

        </div>


        {/* =========================
            MODAL FOOTER
        ========================= */}

        <div className="own-modal-foot">

          <button
            className="own-btn own-btn-close"
            onClick={() =>
              setShowReferralDetailsModal(
                false
              )
            }
          >
            Close
          </button>

        </div>

      </div>

    </div>
)}

    </div>
  );
}