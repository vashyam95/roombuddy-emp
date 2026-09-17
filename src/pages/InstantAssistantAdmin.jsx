import { useEffect, useMemo, useState, useRef } from "react";
import {
  Eye,
  RefreshCw,
  Search,
  UserCheck,
  X,
  Phone,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  KeyRound,
  Home,
  CheckCircle,
  UserRound,
} from "lucide-react";
import axios from "axios";
import "./InstantAssistantAdmin.css";

const API_BASE = "https://roombuddy-api.onrender.com/api";

const ITEMS_PER_PAGE = 10;

export default function InstantAssistantAdmin() {
  const [bookings, setBookings] = useState([]);
  const [buddies, setBuddies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignBooking, setAssignBooking] = useState(null);
  const [selectedBuddyId, setSelectedBuddyId] = useState("");
  const [assigning, setAssigning] = useState(false);


  // =====================================================
  // NEW BOOKING NOTIFICATION
  // =====================================================

  const previousBookingIdsRef = useRef(new Set());
  const notificationInitializedRef = useRef(false);

  const notificationAudioContextRef = useRef(null);
const soundEnabledRef = useRef(true);


  // =====================================================
  // PLAY NEW BOOKING SOUND
  // =====================================================

const playNewBookingSound = async () => {
  try {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      console.error("Web Audio API is not supported");
      return;
    }

    if (!notificationAudioContextRef.current) {
      notificationAudioContextRef.current = new AudioContext();
    }

    const audioContext =
      notificationAudioContextRef.current;

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const now = audioContext.currentTime;

    const playTone = (
      frequency,
      startTime,
      duration,
      volume = 0.25
    ) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        frequency,
        startTime
      );

      gainNode.gain.setValueAtTime(
        0.001,
        startTime
      );

      gainNode.gain.exponentialRampToValueAtTime(
        volume,
        startTime + 0.03
      );

      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        startTime + duration
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // New booking notification
    playTone(520, now, 0.35, 0.28);
    playTone(660, now + 0.18, 0.35, 0.28);
    playTone(880, now + 0.36, 0.5, 0.3);

    console.log("🔔 New booking sound played");
  } catch (err) {
    console.error("❌ NEW BOOKING SOUND ERROR:", err);
  }
};

  // =====================================================
  // FETCH BOOKINGS
  // =====================================================

  const fetchBookings = async (
    showLoader = false,
    checkNewBooking = false
  ) => {
    try {
      if (showLoader) {
        setRefreshing(true);
      }

      const res = await axios.get(
        `${API_BASE}/instant-assistant/admin/bookings`
      );

      if (
        res.data?.success &&
        Array.isArray(res.data.bookings)
      ) {
        const incomingBookings = res.data.bookings;

        const incomingIds = new Set(
          incomingBookings
            .map((booking) => booking.bookingId)
            .filter(Boolean)
        );

        // -------------------------------------------------
        // FIRST LOAD
        // Do NOT play sound for old/existing bookings.
        // -------------------------------------------------
        if (!notificationInitializedRef.current) {
          previousBookingIdsRef.current =
            incomingIds;

          notificationInitializedRef.current = true;
        }

        // -------------------------------------------------
        // AUTO REFRESH
        // Detect genuinely new bookings.
        // -------------------------------------------------
        if (checkNewBooking) {
          const newBookings =
            incomingBookings.filter(
              (booking) =>
                booking.bookingId &&
                !previousBookingIdsRef.current.has(
                  booking.bookingId
                )
            );

          if (newBookings.length > 0) {
            await playNewBookingSound();
          }

          previousBookingIdsRef.current =
            incomingIds;
        }

        setBookings(incomingBookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error(
        "Error fetching Instant Assistant bookings:",
        err
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // FETCH BUDDIES
  // =====================================================

  const fetchBuddies = async () => {
    try {
      console.log("Fetching Instant Assistant Buddies...");

      const res = await axios.get(
        `${API_BASE}/instant-assistant/admin/buddies`
      );

      console.log(
        "INSTANT ASSISTANT BUDDIES RESPONSE:",
        res.data
      );

      if (
        res.data?.success &&
        Array.isArray(res.data.buddies)
      ) {
        setBuddies(res.data.buddies);
      } else {
        console.warn(
          "No buddies returned:",
          res.data
        );
        setBuddies([]);
      }
    } catch (err) {
      console.error(
        "BUDDY FETCH ERROR:",
        err.response?.data || err
      );

      setBuddies([]);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchBookings();
    fetchBuddies();
  }, []);

  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings(false, true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
  const unlockAudio = async () => {
    try {
      const AudioContext =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) return;

      if (!notificationAudioContextRef.current) {
        notificationAudioContextRef.current =
          new AudioContext();
      }

      const audioContext =
        notificationAudioContextRef.current;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      console.log("🔊 Notification sound unlocked");
    } catch (err) {
      console.error(
        "Audio unlock failed:",
        err
      );
    }
  };

  window.addEventListener("click", unlockAudio);
  window.addEventListener("touchstart", unlockAudio);

  return () => {
    window.removeEventListener("click", unlockAudio);
    window.removeEventListener("touchstart", unlockAudio);
  };
}, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredBookings = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return bookings;

    return bookings.filter((booking) => {
      return (
        booking.bookingId
          ?.toLowerCase()
          .includes(value) ||
        booking.mobile
          ?.toLowerCase()
          .includes(value) ||
        booking.locationName
          ?.toLowerCase()
          .includes(value) ||
        booking.roomType
          ?.toLowerCase()
          .includes(value) ||
        booking.status
          ?.toLowerCase()
          .includes(value) ||
        booking.assignedBuddyId?.name
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [bookings, search]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / ITEMS_PER_PAGE)
  );

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // =====================================================
  // COUNTS
  // =====================================================

  const totalCount = bookings.length;

  const confirmedCount = bookings.filter(
    (b) => b.status === "CONFIRMED"
  ).length;

  const assignedCount = bookings.filter(
    (b) => b.status === "ASSIGNED"
  ).length;

  const completedCount = bookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;

  // =====================================================
  // VIEW DETAILS
  // =====================================================

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // =====================================================
  // OPEN ASSIGN MODAL
  // =====================================================

  const handleOpenAssign = (booking) => {
    setAssignBooking(booking);

    setSelectedBuddyId(
      booking.assignedBuddyId?._id || ""
    );

    setShowAssignModal(true);
  };

  // =====================================================
  // ASSIGN BUDDY
  // =====================================================

  const handleAssignBuddy = async () => {
    if (!assignBooking) return;

    if (!selectedBuddyId) {
      alert("Please select a Buddy");
      return;
    }

    try {
      setAssigning(true);

      const res = await axios.put(
        `${API_BASE}/instant-assistant/admin/bookings/${assignBooking.bookingId}/assign`,
        {
          buddyId: selectedBuddyId,
        }
      );

      if (!res.data?.success) {
        throw new Error(
          res.data?.message || "Assignment failed"
        );
      }

      alert("Buddy assigned successfully");

      setShowAssignModal(false);
      setAssignBooking(null);
      setSelectedBuddyId("");

      await fetchBookings(false);
    } catch (err) {
      console.error("Buddy assignment failed:", err);

      alert(
        err.response?.data?.message ||
        err.message ||
        "Failed to assign Buddy"
      );
    } finally {
      setAssigning(false);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // FORMAT DATE + TIME
  // =====================================================

  const formatDateTime = (date) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // SERVICE TIME
  // =====================================================

  const formatHour = (hour) => {
    if (hour === undefined || hour === null) {
      return "-";
    }

    const h = Number(hour);

    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";

    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "ia-status confirmed";

      case "ASSIGNED":
        return "ia-status assigned";

      case "COMPLETED":
        return "ia-status completed";

      case "CANCELLED":
        return "ia-status cancelled";

      case "SEARCHING":
      case "ASSIGNING":
        return "ia-status searching";

      default:
        return "ia-status";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="ia-admin-page">
        <div className="ia-loading">
          <RefreshCw size={24} className="ia-spin" />
          <span>Loading Instant Assistant bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ia-admin-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="ia-header">

        <div>
          <h1>Instant Assistant</h1>

          <p>
            Manage customer bookings and assign Buddies
          </p>
        </div>

        <button
          className="ia-refresh-btn"
          onClick={() => fetchBookings(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "ia-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>


      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="ia-summary-grid">

        <div className="ia-summary-card">
          <div className="ia-summary-icon">
            <Home size={20} />
          </div>

          <div>
            <span>Total Bookings</span>
            <strong>{totalCount}</strong>
          </div>
        </div>


        <div className="ia-summary-card">
          <div className="ia-summary-icon">
            <Clock size={20} />
          </div>

          <div>
            <span>Confirmed</span>
            <strong>{confirmedCount}</strong>
          </div>
        </div>


        <div className="ia-summary-card">
          <div className="ia-summary-icon">
            <UserCheck size={20} />
          </div>

          <div>
            <span>Assigned</span>
            <strong>{assignedCount}</strong>
          </div>
        </div>


        <div className="ia-summary-card">
          <div className="ia-summary-icon">
            <CheckCircle size={20} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="ia-toolbar">

        <div className="ia-search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search Booking ID, mobile, location, Buddy..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          {search && (
            <button
              className="ia-search-clear"
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
            >
              <X size={16} />
            </button>
          )}

        </div>

        <div className="ia-result-count">
          {filteredBookings.length} booking
          {filteredBookings.length !== 1 ? "s" : ""}
        </div>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="ia-table-wrapper">

        <table className="ia-table">

          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Location</th>
              <th>Price</th>
              <th>Status</th>
              <th>Buddy</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {paginatedBookings.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="ia-empty"
                >
                  No Instant Assistant bookings found
                </td>
              </tr>
            ) : (
              paginatedBookings.map((booking) => {

                const buddy =
                  booking.assignedBuddyId;

                return (
                  <tr key={booking._id}>

                    <td>
                      <strong className="ia-booking-id">
                        {booking.bookingId}
                      </strong>

                      <small>
                        {formatDateTime(
                          booking.createdAt
                        )}
                      </small>
                    </td>


                    <td>
                      <div className="ia-customer">

                        <Phone size={15} />

                        <span>
                          {booking.mobile}
                        </span>

                      </div>
                    </td>


                    <td>

                      <strong>
                        {booking.roomType}
                      </strong>

                      <small>
                        {booking.durationLabel}
                      </small>

                      <small>
                        {formatHour(
                          booking.startHour
                        )}{" "}
                        -{" "}
                        {formatHour(
                          booking.endHour
                        )}
                      </small>

                    </td>


                    <td>

                      <div className="ia-location">

                        <MapPin size={15} />

                        <span>
                          {booking.locationName}
                        </span>

                      </div>

                      <small>
                        {formatDate(
                          booking.date
                        )}
                      </small>

                    </td>


                    <td>

                      <div className="ia-price">

                        <IndianRupee size={14} />

                        {Number(
                          booking.price || 0
                        ).toLocaleString("en-IN")}

                      </div>

                    </td>


                    <td>

                      <span
                        className={getStatusClass(
                          booking.status
                        )}
                      >
                        {booking.status}
                      </span>

                    </td>


                    <td>

                      {buddy ? (
                        <div className="ia-buddy-cell">

                          <strong>
                            {buddy.name}
                          </strong>

                          <small>
                            {buddy.mobile}
                          </small>

                          {booking.otpVerified ? (
                            <span className="ia-verified">
                              <CheckCircle size={13} />
                              OTP Verified
                            </span>
                          ) : (
                            <span className="ia-otp-mini">
                              OTP:{" "}
                              {booking.startOtp ||
                                "—"}
                            </span>
                          )}

                        </div>
                      ) : (
                        <span className="ia-not-assigned">
                          Not Assigned
                        </span>
                      )}

                    </td>


                    <td>

                      <div className="ia-actions">

                        <button
                          className="ia-view-btn"
                          onClick={() =>
                            handleViewDetails(
                              booking
                            )
                          }
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>


                        {!buddy &&
                          booking.status !==
                          "CANCELLED" && (
                            <button
                              className="ia-assign-btn"
                              onClick={() =>
                                handleOpenAssign(
                                  booking
                                )
                              }
                            >
                              <UserCheck size={15} />
                              Assign
                            </button>
                          )}

                        {buddy && (
                          <button
                            className="ia-reassign-btn"
                            onClick={() =>
                              handleOpenAssign(
                                booking
                              )
                            }
                          >
                            Reassign
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>
                );
              })
            )}

          </tbody>

        </table>

      </div>


      {/* =================================================
          PAGINATION
      ================================================= */}

      {filteredBookings.length > ITEMS_PER_PAGE && (
        <div className="ia-pagination">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((p) =>
                Math.max(1, p - 1)
              )
            }
          >
            Previous
          </button>


          <span>
            Page {currentPage} of {totalPages}
          </span>


          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
          >
            Next
          </button>

        </div>
      )}


      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {showModal && selectedBooking && (
        <div
          className="ia-modal-overlay"
          onClick={() => setShowModal(false)}
        >

          <div
            className="ia-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="ia-modal-header">

              <div>
                <h2>
                  Instant Assistant Details
                </h2>

                <span>
                  {selectedBooking.bookingId}
                </span>
              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
              >
                <X size={20} />
              </button>

            </div>


            <div className="ia-modal-body">

              {/* CUSTOMER */}

              <div className="ia-detail-section">

                <h3>
                  <UserRound size={17} />
                  Customer Details
                </h3>

                <div className="ia-detail-grid">

                  <div>
                    <label>Mobile</label>
                    <strong>
                      {selectedBooking.mobile}
                    </strong>
                  </div>

                  <div>
                    <label>Room Type</label>
                    <strong>
                      {selectedBooking.roomType}
                    </strong>
                  </div>

                </div>

              </div>


              {/* SERVICE */}

              <div className="ia-detail-section">

                <h3>
                  <Home size={17} />
                  Service Details
                </h3>

                <div className="ia-detail-grid">

                  <div>
                    <label>Location</label>
                    <strong>
                      {selectedBooking.locationName}
                    </strong>
                  </div>

                  <div>
                    <label>Date</label>
                    <strong>
                      {formatDate(
                        selectedBooking.date
                      )}
                    </strong>
                  </div>

                  <div>
                    <label>Service Time</label>
                    <strong>
                      {formatHour(
                        selectedBooking.startHour
                      )}{" "}
                      -{" "}
                      {formatHour(
                        selectedBooking.endHour
                      )}
                    </strong>
                  </div>

                  <div>
                    <label>Duration</label>
                    <strong>
                      {selectedBooking.durationLabel}
                    </strong>
                  </div>

                  <div>
                    <label>Price</label>
                    <strong>
                      ₹
                      {Number(
                        selectedBooking.price || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <label>Status</label>
                    <span
                      className={getStatusClass(
                        selectedBooking.status
                      )}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>

                </div>

              </div>


              {/* BUDDY */}

              <div className="ia-detail-section">

                <h3>
                  <UserCheck size={17} />
                  Buddy Assignment
                </h3>

                {selectedBooking.assignedBuddyId ? (
                  <div className="ia-assigned-box">

                    <div className="ia-assigned-top">

                      <div>
                        <label>Buddy Name</label>
                        <strong>
                          {
                            selectedBooking
                              .assignedBuddyId
                              .name
                          }
                        </strong>
                      </div>

                      <span
                        className={getStatusClass(
                          selectedBooking.status
                        )}
                      >
                        {selectedBooking.status}
                      </span>

                    </div>


                    <div className="ia-detail-grid">

                      <div>
                        <label>Mobile</label>
                        <strong>
                          {
                            selectedBooking
                              .assignedBuddyId
                              .mobile
                          }
                        </strong>
                      </div>

                      <div>
                        <label>Email</label>
                        <strong>
                          {
                            selectedBooking
                              .assignedBuddyId
                              .email ||
                            "-"
                          }
                        </strong>
                      </div>

                      <div>
                        <label>Assigned At</label>
                        <strong>
                          {formatDateTime(
                            selectedBooking.assignedAt
                          )}
                        </strong>
                      </div>

                      <div>
                        <label>OTP</label>
                        <strong className="ia-big-otp">
                          {selectedBooking.startOtp ||
                            "—"}
                        </strong>
                      </div>

                      <div>
                        <label>OTP Status</label>

                        {selectedBooking.otpVerified ? (
                          <span className="ia-otp-success">
                            <CheckCircle size={15} />
                            Verified
                          </span>
                        ) : (
                          <span className="ia-otp-pending">
                            Waiting for Buddy
                          </span>
                        )}
                      </div>

                      <div>
                        <label>OTP Entered At</label>
                        <strong>
                          {formatDateTime(
                            selectedBooking.otpEnteredAt
                          )}
                        </strong>
                      </div>

                      <div>
                        <label>Properties Added</label>
                        <strong className="ia-property-count">
                          <Home size={16} />
                          {selectedBooking.propertiesCount ??
                            0}
                        </strong>
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="ia-unassigned-box">
                    <UserCheck size={20} />
                    <span>
                      No Buddy assigned yet
                    </span>

                    <button
                      onClick={() => {
                        setShowModal(false);
                        handleOpenAssign(
                          selectedBooking
                        );
                      }}
                    >
                      Assign Buddy
                    </button>
                  </div>
                )}

              </div>

            </div>


            <div className="ia-modal-footer">

              <button
                className="ia-close-btn"
                onClick={() =>
                  setShowModal(false)
                }
              >
                Close
              </button>

              {selectedBooking.assignedBuddyId && (
                <button
                  className="ia-footer-assign-btn"
                  onClick={() => {
                    setShowModal(false);
                    handleOpenAssign(
                      selectedBooking
                    );
                  }}
                >
                  Reassign Buddy
                </button>
              )}

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          ASSIGN BUDDY MODAL
      ================================================= */}

      {showAssignModal && assignBooking && (
        <div
          className="ia-modal-overlay"
          onClick={() =>
            !assigning &&
            setShowAssignModal(false)
          }
        >

          <div
            className="ia-assign-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="ia-modal-header">

              <div>
                <h2>
                  Assign Buddy
                </h2>

                <span>
                  {assignBooking.bookingId}
                </span>
              </div>

              <button
                disabled={assigning}
                onClick={() =>
                  setShowAssignModal(false)
                }
              >
                <X size={20} />
              </button>

            </div>


            <div className="ia-assign-body">

              <div className="ia-assignment-booking">

                <div>
                  <label>Customer</label>
                  <strong>
                    {assignBooking.mobile}
                  </strong>
                </div>

                <div>
                  <label>Location</label>
                  <strong>
                    {assignBooking.locationName}
                  </strong>
                </div>

                <div>
                  <label>Service</label>
                  <strong>
                    {assignBooking.roomType} •{" "}
                    {assignBooking.durationLabel}
                  </strong>
                </div>

              </div>


              <label className="ia-select-label">
                Select Buddy
              </label>

              <select
                className="ia-buddy-select"
                value={selectedBuddyId}
                onChange={(e) =>
                  setSelectedBuddyId(
                    e.target.value
                  )
                }
                disabled={assigning}
              >

                <option value="">
                  Select a Buddy
                </option>

                {buddies.map((buddy) => (
                  <option
                    key={buddy._id}
                    value={buddy._id}
                  >
                    {buddy.name} —{" "}
                    {buddy.mobile}
                  </option>
                ))}

              </select>


              {selectedBuddyId && (
                <div className="ia-selected-buddy">

                  {(() => {
                    const buddy =
                      buddies.find(
                        (b) =>
                          b._id ===
                          selectedBuddyId
                      );

                    if (!buddy) return null;

                    return (
                      <>
                        <div className="ia-selected-buddy-icon">
                          <UserRound size={22} />
                        </div>

                        <div>
                          <strong>
                            {buddy.name}
                          </strong>

                          <span>
                            {buddy.mobile}
                          </span>

                          <small>
                            {buddy.email ||
                              "No email"}
                          </small>
                        </div>
                      </>
                    );
                  })()}

                </div>
              )}


              <div className="ia-assignment-note">

                <KeyRound size={17} />

                <span>
                  A new 4-digit OTP will be
                  generated automatically after
                  assignment.
                </span>

              </div>

            </div>


            <div className="ia-modal-footer">

              <button
                className="ia-close-btn"
                disabled={assigning}
                onClick={() =>
                  setShowAssignModal(false)
                }
              >
                Cancel
              </button>

              <button
                className="ia-footer-assign-btn"
                disabled={
                  assigning ||
                  !selectedBuddyId
                }
                onClick={handleAssignBuddy}
              >

                {assigning ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="ia-spin"
                    />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserCheck size={16} />
                    Assign Buddy
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}