import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import "./OwnerRequest.css";
import axios from "axios";

const API =
  "https://roombuddy-api.onrender.com/api";

export default function OwnerRequest() {
  const [requests, setRequests] = useState([]);

  const [editingId, setEditingId] =
    useState(null);

  const [editedStatus, setEditedStatus] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);


  /* =====================================================
     OWNER PROPERTY DETAILS MODAL
  ===================================================== */

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);


  /* =====================================================
     ₹499 FIND ROOM CUSTOMER ASSIGNMENT
  ===================================================== */

  const [findRoomCustomers, setFindRoomCustomers] =
    useState([]);

  const [findRoomLoading, setFindRoomLoading] =
    useState(false);

  const [
    selectedPropertyForAssignment,
    setSelectedPropertyForAssignment,
  ] = useState(null);

  const [showAssignModal, setShowAssignModal] =
    useState(false);

  const [assigningCustomerId, setAssigningCustomerId] =
    useState(null);

  const [assignmentLoading, setAssignmentLoading] =
    useState(false);

  const [findRoomSearch, setFindRoomSearch] =
    useState("");


  const itemsPerPage = 10;


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchRequests();
  }, []);


  /* =====================================================
     FETCH OWNER PROPERTIES
  ===================================================== */

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/owner-postings`
      );

      if (Array.isArray(res.data)) {
        setRequests(res.data);
      } else if (
        Array.isArray(res.data.data)
      ) {
        setRequests(res.data.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error(
        "Error fetching owner postings:",
        err
      );
    } finally {
      setLoading(false);
    }
  };


  /* =====================================================
     VIEW PROPERTY DETAILS
  ===================================================== */

  const handleViewDetails = (data) => {
    setSelectedRequest(data);
    setShowModal(true);
  };


  /* =====================================================
     SUMMARY COUNTS
  ===================================================== */

  const pendingCount =
    requests.filter(
      (r) =>
        r.status?.toLowerCase() ===
        "pending"
    ).length;


  const approvedCount =
    requests.filter(
      (r) =>
        r.status?.toLowerCase() ===
        "approved"
    ).length;


  const completedCount =
    requests.filter(
      (r) =>
        r.status?.toLowerCase() ===
        "completed"
    ).length;


  /* =====================================================
     EDIT PROPERTY STATUS
  ===================================================== */

  const handleEdit = (
    id,
    currentStatus
  ) => {
    setEditingId(id);

    setEditedStatus(
      currentStatus || "Pending"
    );
  };


  const handleSave = async (
    request
  ) => {
    try {
      await axios.put(
        `${API}/owner-postings/${request._id}/status`,
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


  /* =====================================================
     FETCH ₹499 CUSTOMERS
  ===================================================== */

  const fetchFindRoomCustomers =
    async () => {
      try {
        setFindRoomLoading(true);

        const res = await axios.get(
          `${API}/find-room`
        );

        const allRequests =
          Array.isArray(
            res.data?.data
          )
            ? res.data.data
            : [];


        /*
         * ₹499 paid customers only.
         *
         * Cancelled requests are excluded.
         *
         * Completed requests are still included
         * because the 1-month booking can receive
         * multiple properties.
         */

        const paidCustomers =
          allRequests.filter(
            (item) =>
              item.payment?.status ===
              "Paid" &&
              item.status !==
              "Cancelled"
          );


        setFindRoomCustomers(
          paidCustomers
        );

      } catch (err) {

        console.error(
          "Error fetching Find Room customers:",
          err
        );

        setFindRoomCustomers([]);

      } finally {

        setFindRoomLoading(
          false
        );
      }
    };


  /* =====================================================
     OPEN ASSIGN MODAL
  ===================================================== */

  const openAssignModal = async (
    property
  ) => {

    setSelectedPropertyForAssignment(
      property
    );

    setFindRoomSearch("");

    setShowAssignModal(true);

    await fetchFindRoomCustomers();
  };


  /* =====================================================
     CLOSE ASSIGN MODAL
  ===================================================== */

  const closeAssignModal = () => {

    if (assignmentLoading) {
      return;
    }

    setShowAssignModal(false);

    setSelectedPropertyForAssignment(
      null
    );

    setAssigningCustomerId(
      null
    );

    setFindRoomSearch("");
  };


  /* =====================================================
     FILTER ₹499 CUSTOMERS
  ===================================================== */

  const filteredFindRoomCustomers =
    findRoomCustomers.filter(
      (customer) => {

        const q =
          findRoomSearch
            .trim()
            .toLowerCase();


        if (!q) {
          return true;
        }


        return (
          String(
            customer.phone || ""
          )
            .toLowerCase()
            .includes(q) ||

          String(
            customer.requestId || ""
          )
            .toLowerCase()
            .includes(q) ||

          String(
            customer.roomType || ""
          )
            .toLowerCase()
            .includes(q) ||

          String(
            customer.preferredLocation ||
            ""
          )
            .toLowerCase()
            .includes(q)
        );
      }
    );


  /* =====================================================
     ASSIGN PROPERTY TO ₹499 CUSTOMER
  ===================================================== */

  const handleAssignProperty =
    async (customer) => {

      if (
        !selectedPropertyForAssignment?._id ||
        !customer?._id
      ) {
        return;
      }


      try {

        setAssignmentLoading(
          true
        );

        setAssigningCustomerId(
          customer._id
        );


        /*
         * Keep previously assigned
         * properties.
         */

        const existingPropertyIds =
          Array.isArray(
            customer.propertyIds
          )
            ? customer.propertyIds.map(
              (id) =>
                String(
                  id?._id || id
                )
            )
            : [];


        const propertyId =
          String(
            selectedPropertyForAssignment._id
          );


        /*
         * Prevent duplicate assignment.
         */

        if (
          existingPropertyIds.includes(
            propertyId
          )
        ) {

          alert(
            "This property is already assigned to this customer."
          );

          return;
        }


        const updatedPropertyIds =
          [
            ...existingPropertyIds,
            propertyId,
          ];


        /*
         * Update FindRoom.
         */

        const response =
          await axios.put(
            `${API}/find-room/${customer._id}/properties`,
            {
              propertyId:
                selectedPropertyForAssignment._id,
            }
          );


        if (
          !response.data?.success
        ) {

          throw new Error(
            response.data?.message ||
            "Property assignment failed"
          );
        }


        /*
         * Update customer in local state
         * so the count changes immediately.
         */

        setFindRoomCustomers(
          (prev) =>
            prev.map(
              (item) =>
                item._id ===
                  customer._id
                  ? {
                    ...item,

                    propertyIds:
                      updatedPropertyIds,

                    status:
                      "Completed",
                  }
                  : item
            )
        );


        alert(
          "Property assigned successfully to the ₹499 customer."
        );

      } catch (err) {

        console.error(
          "FIND ROOM PROPERTY ASSIGNMENT ERROR:",
          err
        );

        alert(
          err.response?.data?.message ||
          err.message ||
          "Failed to assign property"
        );

      } finally {

        setAssignmentLoading(
          false
        );

        setAssigningCustomerId(
          null
        );
      }
    };


  /* =====================================================
     PROPERTY SEARCH
  ===================================================== */

  const filtered =
    requests.filter(
      (r) => {

        const searchText =
          search
            .toLowerCase();

        return (
          r.area
            ?.toLowerCase()
            .includes(searchText) ||

          r.building
            ?.toLowerCase()
            .includes(searchText) ||

          r.type
            ?.toLowerCase()
            .includes(searchText)
        );
      }
    );


  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages =
    Math.ceil(
      filtered.length /
      itemsPerPage
    );


  const startIndex =
    (currentPage - 1) *
    itemsPerPage;


  const paginatedData =
    filtered.slice(
      startIndex,
      startIndex +
      itemsPerPage
    );


  return (
    <div className="own-page">

      {/* =================================================
          HERO
      ================================================= */}

      <div className="own-hero">

        <div>

          <h2 className="own-title">
            Owner Property Requests
          </h2>

          <p className="own-sub">
            Review, approve and manage every
            owner-submitted listing.
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
              fetchFindRoomCustomers();
            }}
            disabled={
              loading ||
              findRoomLoading
            }
          >

            <RefreshCw
              size={16}
              className={
                loading ||
                  findRoomLoading
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


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="own-summary">

        <div className="own-summary-card own-card-completed">

          <span className="own-dot" />

          <div>

            <h3>
              Completed
            </h3>

            <p>
              {completedCount}
            </p>

          </div>

        </div>


        <div className="own-summary-card own-card-approved">

          <span className="own-dot" />

          <div>

            <h3>
              Approved
            </h3>

            <p>
              {approvedCount}
            </p>

          </div>

        </div>


        <div className="own-summary-card own-card-pending">

          <span className="own-dot" />

          <div>

            <h3>
              Pending
            </h3>

            <p>
              {pendingCount}
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

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
            placeholder="Search by Area, Building, or Type…"
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


      {/* =================================================
          OWNER PROPERTY TABLE
      ================================================= */}

      <div className="own-table-wrap">

        <table className="own-table">

          <thead>

            <tr>

              <th>
                Building
              </th>

              <th>
                Area
              </th>

              <th>
                Type
              </th>

              <th>
                Furnishing
              </th>

              <th>
                Rent
              </th>

              <th>
                Status
              </th>

              <th>
                Action
              </th>

              <th>
                Posted On
              </th>

            </tr>

          </thead>


          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan="8"
                  className="own-empty"
                >
                  Loading…
                </td>

              </tr>

            ) : paginatedData.length >
              0 ? (

              paginatedData.map(
                (r) => (

                  <tr
                    key={r._id}
                  >

                    {/* BUILDING */}

                    <td
                      className="own-link"
                      onClick={() =>
                        handleViewDetails(r)
                      }
                    >
                      {r.building}
                    </td>


                    {/* AREA */}

                    <td>
                      {r.area}
                    </td>


                    {/* TYPE */}

                    <td>
                      {r.type}
                    </td>


                    {/* FURNISHING */}

                    <td>
                      {r.furnishing}
                    </td>


                    {/* RENT */}

                    <td className="own-rent">
                      ₹ {r.rent}
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

                          <option value="Approved">
                            Approved
                          </option>

                          <option value="Completed">
                            Completed
                          </option>

                          <option value="Closed">
                            Closed
                          </option>

                        </select>

                      ) : (

                        <span
                          className={`own-badge own-badge-${(
                            r.status ||
                            "Pending"
                          ).toLowerCase()}`}
                        >
                          {r.status}
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

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "8px",
                          }}
                        >

                          {/* ASSIGN — EVERY PROPERTY */}

                          <button
                            className="own-btn own-btn-edit"
                            onClick={() =>
                              openAssignModal(
                                r
                              )
                            }
                          >
                            Assign
                          </button>


                          {/* EXISTING EDIT */}

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

                        </div>

                      )}

                    </td>


                    {/* POSTED ON */}

                    <td>

                      {r.createdAt
                        ? new Date(
                          r.createdAt
                        ).toLocaleDateString()
                        : "-"}

                    </td>

                  </tr>

                )
              )

            ) : (

              <tr>

                <td
                  colSpan="8"
                  className="own-empty"
                >
                  No owner postings found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* =================================================
          OWNER PROPERTY DETAILS MODAL
      ================================================= */}

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

              <div className="own-modal-head">

                <div>

                  <h3>
                    {
                      selectedRequest.building
                    }
                  </h3>

                  <span className="own-modal-sub">
                    {
                      selectedRequest.area
                    }{" "}
                    ·{" "}
                    {
                      selectedRequest.type
                    }
                  </span>

                </div>


                <span
                  className={`own-badge own-badge-${(
                    selectedRequest.status ||
                    ""
                  ).toLowerCase()}`}
                >
                  {
                    selectedRequest.status
                  }
                </span>

              </div>


              <div className="own-details-grid">

                <div>
                  <label>
                    Building
                  </label>

                  <span>
                    {
                      selectedRequest.building
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Area
                  </label>

                  <span>
                    {
                      selectedRequest.area
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Type
                  </label>

                  <span>
                    {
                      selectedRequest.type
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Furnishing
                  </label>

                  <span>
                    {
                      selectedRequest.furnishing
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Tenant Type
                  </label>

                  <span>
                    {
                      selectedRequest.tenantType
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Bathrooms
                  </label>

                  <span>
                    {
                      selectedRequest.bathrooms
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Floor
                  </label>

                  <span>
                    {
                      selectedRequest.floor
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Flat No
                  </label>

                  <span>
                    {
                      selectedRequest.flat
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Pincode
                  </label>

                  <span>
                    {
                      selectedRequest.pincode
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Rent
                  </label>

                  <span>
                    ₹{" "}
                    {
                      selectedRequest.rent
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Advance
                  </label>

                  <span>
                    {
                      selectedRequest.advance
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Contact No 1
                  </label>

                  <span>
                    {
                      selectedRequest.contact
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Contact No 2
                  </label>

                  <span>
                    {
                      selectedRequest.altContact
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Latitude
                  </label>

                  <span>
                    {
                      selectedRequest.latitude
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Longitude
                  </label>

                  <span>
                    {
                      selectedRequest.longitude
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Parking (Bike/Car)
                  </label>

                  <span>
                    {
                      selectedRequest.parkingCombined
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Geyser
                  </label>

                  <span>
                    {
                      selectedRequest.geyser
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Power Backup
                  </label>

                  <span>
                    {
                      selectedRequest.powerBackup
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Security
                  </label>

                  <span>
                    {
                      selectedRequest.security
                    }
                  </span>
                </div>


                <div>
                  <label>
                    CCTV
                  </label>

                  <span>
                    {
                      selectedRequest.cctv
                    }
                  </span>
                </div>

              </div>


              {selectedRequest.images?.length >
                0 && (

                  <div className="own-images">

                    <strong>
                      Images
                    </strong>

                    <div className="own-images-row">

                      {selectedRequest.images.map(
                        (
                          img,
                          index
                        ) => (

                          <img
                            key={index}
                            src={img}
                            alt="property"
                          />

                        )
                      )}

                    </div>

                  </div>
                )}


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


      {/* =================================================
          ASSIGN PROPERTY TO ₹499 CUSTOMER
      ================================================= */}

      {showAssignModal &&
        selectedPropertyForAssignment && (

          <div
            className="own-modal-overlay"
            onClick={closeAssignModal}
          >

            <div
              className="own-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* HEADER */}

              <div className="own-modal-head">

                <div>

                  <h3>
                    Assign Property
                  </h3>

                  <span className="own-modal-sub">
                    {
                      selectedPropertyForAssignment.building
                    }{" "}
                    ·{" "}
                    {
                      selectedPropertyForAssignment.area
                    }
                  </span>

                </div>


                <span
                  className={`own-badge own-badge-${(
                    selectedPropertyForAssignment.status ||
                    "Pending"
                  ).toLowerCase()}`}
                >
                  {
                    selectedPropertyForAssignment.status
                  }
                </span>

              </div>


              {/* PROPERTY SUMMARY */}

              <div
                className="own-details-grid"
                style={{
                  marginBottom:
                    "18px",
                }}
              >

                <div>

                  <label>
                    Property
                  </label>

                  <span>
                    {
                      selectedPropertyForAssignment.building ||
                      "-"
                    }
                  </span>

                </div>


                <div>

                  <label>
                    Area
                  </label>

                  <span>
                    {
                      selectedPropertyForAssignment.area ||
                      "-"
                    }
                  </span>

                </div>


                <div>

                  <label>
                    Type
                  </label>

                  <span>
                    {
                      selectedPropertyForAssignment.type ||
                      "-"
                    }
                  </span>

                </div>


                <div>

                  <label>
                    Rent
                  </label>

                  <span>
                    ₹{" "}
                    {
                      selectedPropertyForAssignment.rent ||
                      "0"
                    }
                  </span>

                </div>

              </div>


              {/* =================================================
                CUSTOMER SEARCH
            ================================================= */}

              <div
                className="own-search"
                style={{
                  marginBottom:
                    "12px",
                }}
              >

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
                  placeholder="Search customer, mobile, request, room or location…"
                  value={
                    findRoomSearch
                  }
                  onChange={(e) =>
                    setFindRoomSearch(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* CUSTOMER HEADER */}

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  marginBottom:
                    "12px",
                }}
              >

                <strong>
                  Select ₹499 Customer
                </strong>


                <span
                  style={{
                    fontSize:
                      "12px",
                    color:
                      "#6b7280",
                  }}
                >
                  {
                    filteredFindRoomCustomers.length
                  }{" "}
                  customers
                </span>

              </div>


              {/* CUSTOMER LIST */}

              {findRoomLoading ? (

                <div className="own-empty">
                  Loading ₹499 customers…
                </div>

              ) : filteredFindRoomCustomers.length ===
                0 ? (

                <div className="own-empty">

                  {findRoomCustomers.length ===
                    0
                    ? "No paid ₹499 customers available."
                    : "No matching ₹499 customers found."}

                </div>

              ) : (

                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap:
                      "8px",
                    maxHeight:
                      "360px",
                    overflowY:
                      "auto",
                  }}
                >

                  {filteredFindRoomCustomers.map(
                    (
                      customer
                    ) => {

                      const propertyIds =
                        Array.isArray(
                          customer.propertyIds
                        )
                          ? customer.propertyIds
                          : [];


                      const normalizedPropertyIds =
                        propertyIds.map(
                          (id) =>
                            String(
                              id?._id ||
                              id
                            )
                        );


                      const alreadyAssigned =
                        normalizedPropertyIds.includes(
                          String(
                            selectedPropertyForAssignment._id
                          )
                        );


                      const isAssigning =
                        assignmentLoading &&
                        assigningCustomerId ===
                        customer._id;


                      return (

                        <div
                          key={
                            customer._id
                          }
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            gap:
                              "12px",
                            padding:
                              "12px",
                            border:
                              "1px solid #e5e7eb",
                            borderRadius:
                              "10px",
                            background:
                              "#fff",
                          }}
                        >

                          <div
                            style={{
                              minWidth:
                                0,
                            }}
                          >

                            <strong
                              style={{
                                display:
                                  "block",
                              }}
                            >
                              {
                                customer.phone ||
                                "No mobile"
                              }
                            </strong>


                            <span
                              style={{
                                display:
                                  "block",
                                marginTop:
                                  "3px",
                                fontSize:
                                  "12px",
                                color:
                                  "#6b7280",
                              }}
                            >
                              Request:{" "}
                              {
                                customer.requestId ||
                                "-"
                              }
                            </span>


                            <span
                              style={{
                                display:
                                  "block",
                                marginTop:
                                  "3px",
                                fontSize:
                                  "12px",
                                color:
                                  "#6b7280",
                              }}
                            >
                              {
                                customer.roomType ||
                                "-"
                              }

                              {" · "}

                              {
                                customer.preferredLocation ||
                                "-"
                              }
                            </span>


                            <span
                              style={{
                                display:
                                  "block",
                                marginTop:
                                  "3px",
                                fontSize:
                                  "12px",
                                color:
                                  "#6b7280",
                              }}
                            >
                              {
                                propertyIds.length
                              }{" "}
                              properties assigned
                            </span>

                          </div>


                          <button
                            type="button"
                            className="own-btn own-btn-edit"
                            disabled={
                              assignmentLoading ||
                              alreadyAssigned
                            }
                            onClick={() =>
                              handleAssignProperty(
                                customer
                              )
                            }
                          >

                            {isAssigning
                              ? "Assigning…"
                              : alreadyAssigned
                                ? "Assigned"
                                : "Assign"}

                          </button>

                        </div>

                      );
                    }
                  )}

                </div>

              )}


              {/* FOOTER */}

              <div className="own-modal-foot">

                <button
                  className="own-btn own-btn-close"
                  onClick={
                    closeAssignModal
                  }
                  disabled={
                    assignmentLoading
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>
        )}


      {/* =================================================
          PAGINATION
      ================================================= */}

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

    </div>
  );
}