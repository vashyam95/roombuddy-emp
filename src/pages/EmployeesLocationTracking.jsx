import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    MapPin,
    RefreshCw,
    User,
    Clock,
    Navigation,
    Target,
    X,
} from "lucide-react";
import "./Leaves.css";

const API =
    "https://roombuddy-api.onrender.com/api/employee-location/admin";

export default function EmployeesLocationTracking() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [employeeFilter, setEmployeeFilter] =
        useState(null);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);

    // ==========================================
    // FETCH LOCATIONS
    // ==========================================

    const fetchLocations = async () => {
        try {
            setLoading(true);

            const res = await axios.get(API);

            console.log(
                "LOCATION DATA:",
                res.data
            );

            setLocations(
                res.data?.data || []
            );

        } catch (err) {

            console.error(
                "LOCATION FETCH ERROR:",
                err.response?.data || err
            );

            alert(
                err.response?.data?.message ||
                "Failed to load employee locations"
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        fetchLocations();
    }, []);

    // ==========================================
    // AUTO REFRESH
    // EVERY 20 MINUTES
    // ==========================================

    useEffect(() => {

        const interval =
            setInterval(() => {
                fetchLocations();
            }, 20 * 60 * 1000);

        return () =>
            clearInterval(interval);

    }, []);

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDateTime = (dateValue) => {

        if (!dateValue) {
            return "—";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    // ==========================================
    // FORMAT ACCURACY
    // ==========================================

    const formatAccuracy = (
        accuracy
    ) => {

        if (
            accuracy === null ||
            accuracy === undefined
        ) {
            return "—";
        }

        if (accuracy >= 1000) {

            return `${(
                accuracy / 1000
            ).toFixed(1)} km`;

        }

        return `${Math.round(
            accuracy
        )} m`;
    };

    // ==========================================
    // FORMAT DISTANCE
    // ==========================================

    const formatDistance = (
        distance
    ) => {

        if (
            distance === null ||
            distance === undefined
        ) {
            return "0.00 M";
        }

        const value =
            Number(distance);

        if (
            !Number.isFinite(value)
        ) {
            return "0.00 M";
        }

        if (value >= 1000) {

            return `${(
                value / 1000
            ).toFixed(2)} KM`;

        }

        return `${value.toFixed(2)} M`;
    };

    // ==========================================
    // INITIALS
    // ==========================================

    const initials = (name) =>
        (name || "?")
            .split(" ")
            .map(
                (word) => word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase();

    // ==========================================
    // GET EMPLOYEE ID
    // Handles populated and non-populated data
    // ==========================================

    const getEmployeeId = (
        location
    ) => {

        return String(
            location?.employeeId?._id ||
            location?.employeeId ||
            ""
        );
    };

    // ==========================================
    // GET EMPLOYEE STATUS
    // ==========================================

    const getTrackingStatus = (
        location
    ) => {

        return (
            location
                ?.employeeId
                ?.trackingStatus ||
            location?.trackingStatus ||
            "OFFLINE"
        );
    };

    // ==========================================
    // STATUS LABEL
    // ==========================================

    const getStatusLabel = (
        status
    ) => {

        switch (status) {

            case "TRACKING":
                return "Tracking";

            case "LOCATION_OFF":
                return "Location Off";

            case "PERMISSION_DENIED":
                return "Permission Denied";

            case "OFFLINE":
                return "Offline";

            case "CHECKED_OUT":
                return "Checked Out";

            default:
                return "Offline";
        }
    };

    // ==========================================
    // STATUS ICON
    // ==========================================

    const getStatusIcon = (
        status
    ) => {

        switch (status) {

            case "TRACKING":
                return "🟢";

            case "LOCATION_OFF":
                return "🔴";

            case "PERMISSION_DENIED":
                return "🟠";

            case "OFFLINE":
                return "⚫";

            case "CHECKED_OUT":
                return "⚪";

            default:
                return "⚫";
        }
    };

    // ==========================================
    // STATUS CSS CLASS
    // ==========================================

    const getStatusClass = (
        status
    ) => {

        switch (status) {

            case "TRACKING":
                return "lv-status-tracking";

            case "LOCATION_OFF":
                return "lv-status-location-off";

            case "PERMISSION_DENIED":
                return "lv-status-permission";

            case "CHECKED_OUT":
                return "lv-status-checked-out";

            case "OFFLINE":
            default:
                return "lv-status-offline";
        }
    };

    // ==========================================
    // UNIQUE EMPLOYEES
    // ==========================================

    const employeeCount =
        useMemo(() => {

            return new Set(
                locations.map(
                    (location) =>
                        getEmployeeId(
                            location
                        )
                )
            ).size;

        }, [locations]);

    // ==========================================
    // TODAY RECORDS
    // ==========================================

    const todayCount =
        useMemo(() => {

            const today =
                new Date();

            return locations.filter(
                (location) => {

                    const date =
                        new Date(
                            location.recordedAt
                        );

                    return (
                        date.getDate() ===
                        today.getDate() &&

                        date.getMonth() ===
                        today.getMonth() &&

                        date.getFullYear() ===
                        today.getFullYear()
                    );
                }
            ).length;

        }, [locations]);

    // ==========================================
    // LATEST LOCATION PER EMPLOYEE
    // ==========================================

    const latestLocations =
        useMemo(() => {

            const map =
                new Map();

            locations.forEach(
                (location) => {

                    const id =
                        getEmployeeId(
                            location
                        );

                    if (
                        !map.has(id)
                    ) {

                        map.set(
                            id,
                            location
                        );
                    }
                }
            );

            return Array.from(
                map.values()
            );

        }, [locations]);

    // ==========================================
    // STATUS COUNTS
    // ==========================================

    const trackingCount =
        useMemo(() => {

            return latestLocations.filter(
                (location) =>
                    getTrackingStatus(
                        location
                    ) === "TRACKING"
            ).length;

        }, [latestLocations]);

    const locationOffCount =
        useMemo(() => {

            return latestLocations.filter(
                (location) =>
                    getTrackingStatus(
                        location
                    ) === "LOCATION_OFF"
            ).length;

        }, [latestLocations]);

    const permissionDeniedCount =
        useMemo(() => {

            return latestLocations.filter(
                (location) =>
                    getTrackingStatus(
                        location
                    ) === "PERMISSION_DENIED"
            ).length;

        }, [latestLocations]);

    const offlineCount =
        useMemo(() => {

            return latestLocations.filter(
                (location) =>
                    getTrackingStatus(
                        location
                    ) === "OFFLINE"
            ).length;

        }, [latestLocations]);

    const checkedOutCount =
        useMemo(() => {

            return latestLocations.filter(
                (location) =>
                    getTrackingStatus(
                        location
                    ) === "CHECKED_OUT"
            ).length;

        }, [latestLocations]);

    // ==========================================
    // SEARCH / FILTER
    // ==========================================

    const filtered =
        useMemo(() => {

            return locations.filter(
                (location) => {

                    const matchEmployee =
                        employeeFilter
                            ? location.employeeName ===
                            employeeFilter
                            : true;

                    const query =
                        search
                            .trim()
                            .toLowerCase();

                    const matchSearch =
                        !query ||

                        (
                            location.employeeName ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                query
                            ) ||

                        String(
                            location.latitude
                        ).includes(
                            query
                        ) ||

                        String(
                            location.longitude
                        ).includes(
                            query
                        ) ||

                        (
                            location.address ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                query
                            );

                    return (
                        matchEmployee &&
                        matchSearch
                    );
                }
            );

        }, [
            locations,
            employeeFilter,
            search,
        ]);

    // ==========================================
    // GOOGLE MAP
    // ==========================================

    const openMap = (
        location
    ) => {

        const url =
            `https://www.google.com/maps/search/?api=1&query=` +
            `${location.latitude},${location.longitude}`;

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="lv-wrap">

            {/* ==========================================
                HERO
            ========================================== */}

            <div className="lv-hero">

                <div className="lv-hero-text">

                    <span className="lv-eyebrow">
                        HR · Live Tracking
                    </span>

                    <h1 className="lv-title">
                        Employee Locations
                    </h1>

                    <p className="lv-subtitle">
                        Monitor employee location
                        activity during working hours
                    </p>

                </div>

                <div className="lv-hero-actions">

                    <button
                        className="lv-hero-btn"
                        onClick={
                            fetchLocations
                        }
                        disabled={
                            loading
                        }
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

                    <div className="lv-hero-badge">

                        <span className="lv-hero-num">
                            {employeeCount}
                        </span>

                        <span className="lv-hero-lbl">
                            Employees
                        </span>

                    </div>

                </div>

            </div>

            {/* ==========================================
                SUMMARY
            ========================================== */}

            <div className="lv-summary">

                <div className="lv-summary-card lv-sc-total">

                    <span className="lv-sc-icon">
                        👥
                    </span>

                    <div>

                        <span className="lv-sc-lbl">
                            Employees
                        </span>

                        <p>
                            {employeeCount}
                        </p>

                    </div>

                </div>

                <div className="lv-summary-card lv-sc-pending">

                    <span className="lv-sc-icon">
                        🟢
                    </span>

                    <div>

                        <span className="lv-sc-lbl">
                            Tracking
                        </span>

                        <p>
                            {trackingCount}
                        </p>

                    </div>

                </div>

                <div className="lv-summary-card lv-sc-approved">

                    <span className="lv-sc-icon">
                        🔴
                    </span>

                    <div>

                        <span className="lv-sc-lbl">
                            Location Off
                        </span>

                        <p>
                            {locationOffCount}
                        </p>

                    </div>

                </div>

                <div className="lv-summary-card lv-sc-rejected">

                    <span className="lv-sc-icon">
                        ⚪
                    </span>

                    <div>

                        <span className="lv-sc-lbl">
                            Checked Out
                        </span>

                        <p>
                            {checkedOutCount}
                        </p>

                    </div>

                </div>

            </div>

            {/* ==========================================
                SECONDARY STATUS SUMMARY
            ========================================== */}

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginBottom: "18px",
                }}
            >

                <span
                    className="lv-status-pill lv-status-permission"
                >
                    🟠 Permission Denied:{" "}
                    {permissionDeniedCount}
                </span>

                <span
                    className="lv-status-pill lv-status-offline"
                >
                    ⚫ Offline:{" "}
                    {offlineCount}
                </span>

            </div>

            {/* ==========================================
                SEARCH
            ========================================== */}

            <div className="lv-toolbar">

                <input
                    className="lv-search"
                    placeholder="🔍 Search employee or location..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

                {employeeFilter && (

                    <div className="lv-focus-chip">

                        <User size={14} />

                        Viewing:{" "}
                        {employeeFilter}

                        <button
                            onClick={() =>
                                setEmployeeFilter(
                                    null
                                )
                            }
                        >

                            <X size={14} />

                        </button>

                    </div>

                )}

            </div>

            {/* ==========================================
                TABLE
            ========================================== */}

            <div className="lv-table-wrap">

                <table className="lv-table">

                    <thead>

                        <tr>

                            <th>#</th>

                            <th>
                                Employee
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Location
                            </th>

                            <th>
                                Distance
                            </th>

                            <th>
                                Accuracy
                            </th>

                            <th>
                                Recorded At
                            </th>

                            <th>
                                Map
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {loading &&
                            locations.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="8"
                                    className="lv-empty"
                                >
                                    Loading employee
                                    locations…
                                </td>

                            </tr>

                        ) : filtered.length >
                            0 ? (

                            filtered.map(
                                (
                                    location,
                                    index
                                ) => {

                                    const status =
                                        getTrackingStatus(
                                            location
                                        );

                                    return (

                                        <tr
                                            key={
                                                location._id
                                            }
                                            className="lv-row"
                                            onClick={() =>
                                                setSelected(
                                                    location
                                                )
                                            }
                                        >

                                            {/* # */}

                                            <td>
                                                {index + 1}
                                            </td>

                                            {/* EMPLOYEE */}

                                            <td
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >

                                                <div className="lv-name-cell">

                                                    <div className="lv-avatar">

                                                        {initials(
                                                            location.employeeName
                                                        )}

                                                    </div>

                                                    <button
                                                        className="lv-name-btn"
                                                        onClick={() =>
                                                            setEmployeeFilter(
                                                                location.employeeName
                                                            )
                                                        }
                                                    >
                                                        {
                                                            location.employeeName
                                                        }
                                                    </button>

                                                </div>

                                            </td>

                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`lv-status-pill ${getStatusClass(
                                                        status
                                                    )}`}
                                                >

                                                    <span>
                                                        {
                                                            getStatusIcon(
                                                                status
                                                            )
                                                        }
                                                    </span>

                                                    {
                                                        getStatusLabel(
                                                            status
                                                        )
                                                    }

                                                </span>

                                            </td>

                                            {/* LOCATION */}

                                            <td>

                                                <span
                                                    style={{
                                                        display:
                                                            "inline-flex",
                                                        alignItems:
                                                            "flex-start",
                                                        gap: "5px",
                                                        maxWidth:
                                                            "350px",
                                                        lineHeight:
                                                            "1.4",
                                                    }}
                                                >

                                                    <MapPin
                                                        size={15}
                                                        style={{
                                                            flexShrink: 0,
                                                            marginTop: "3px",
                                                        }}
                                                    />

                                                    <span>

                                                        {location.address
                                                            ? location.address
                                                            : "Address not available for this record"}

                                                    </span>

                                                </span>

                                            </td>

                                            {/* DISTANCE */}

                                            <td>

                                                <span
                                                    style={{
                                                        display:
                                                            "inline-flex",
                                                        alignItems:
                                                            "center",
                                                        gap: "5px",
                                                        fontWeight:
                                                            "600",
                                                        whiteSpace:
                                                            "nowrap",
                                                    }}
                                                >

                                                    <Navigation
                                                        size={14}
                                                    />

                                                    {
                                                        formatDistance(
                                                            location.totalDistance
                                                        )
                                                    }

                                                </span>

                                            </td>

                                            {/* ACCURACY */}

                                            <td>

                                                <span className="lv-type-pill">

                                                    <Target
                                                        size={13}
                                                    />

                                                    {
                                                        formatAccuracy(
                                                            location.accuracy
                                                        )
                                                    }

                                                </span>

                                            </td>

                                            {/* RECORDED AT */}

                                            <td>

                                                <span
                                                    style={{
                                                        display:
                                                            "inline-flex",
                                                        alignItems:
                                                            "center",
                                                        gap: "5px",
                                                    }}
                                                >

                                                    <Clock
                                                        size={13}
                                                    />

                                                    {
                                                        formatDateTime(
                                                            location.recordedAt
                                                        )
                                                    }

                                                </span>

                                            </td>

                                            {/* MAP */}

                                            <td
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >

                                                <button
                                                    className="lv-btn lv-btn-approve"
                                                    onClick={() =>
                                                        openMap(
                                                            location
                                                        )
                                                    }
                                                >

                                                    <Navigation
                                                        size={14}
                                                    />

                                                    View Map

                                                </button>

                                            </td>

                                        </tr>

                                    );
                                }
                            )

                        ) : (

                            <tr>

                                <td
                                    colSpan="8"
                                    className="lv-empty"
                                >
                                    No employee locations
                                    found.
                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

            {/* ==========================================
                DETAILS MODAL
            ========================================== */}

            {selected && (

                <div
                    className="lv-modal-backdrop"
                    onClick={() =>
                        setSelected(null)
                    }
                >

                    <div
                        className="lv-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="lv-modal-head">

                            <div className="lv-modal-identity">

                                <div className="lv-avatar lv-avatar-lg">

                                    {initials(
                                        selected.employeeName
                                    )}

                                </div>

                                <div>

                                    <h3>
                                        {
                                            selected.employeeName
                                        }
                                    </h3>

                                    <p>

                                        <User
                                            size={12}
                                        />

                                        {" "}

                                        {getEmployeeId(
                                            selected
                                        )}

                                    </p>

                                </div>

                            </div>

                            {/* STATUS */}

                            {(() => {

                                const status =
                                    getTrackingStatus(
                                        selected
                                    );

                                return (

                                    <span
                                        className={`lv-status-pill ${getStatusClass(
                                            status
                                        )}`}
                                    >

                                        {
                                            getStatusIcon(
                                                status
                                            )
                                        }

                                        {" "}

                                        {
                                            getStatusLabel(
                                                status
                                            )
                                        }

                                    </span>

                                );

                            })()}

                        </div>

                        <div className="lv-details-grid">

                            {/* LATITUDE */}

                            <div>

                                <label>

                                    <MapPin
                                        size={12}
                                    />

                                    Latitude

                                </label>

                                <p>
                                    {
                                        selected.latitude
                                    }
                                </p>

                            </div>

                            {/* LONGITUDE */}

                            <div>

                                <label>

                                    <MapPin
                                        size={12}
                                    />

                                    Longitude

                                </label>

                                <p>
                                    {
                                        selected.longitude
                                    }
                                </p>

                            </div>

                            {/* ACCURACY */}

                            <div>

                                <label>

                                    <Target
                                        size={12}
                                    />

                                    Accuracy

                                </label>

                                <p>

                                    {
                                        formatAccuracy(
                                            selected.accuracy
                                        )
                                    }

                                </p>

                            </div>

                            {/* RECORDED */}

                            <div>

                                <label>

                                    <Clock
                                        size={12}
                                    />

                                    Recorded At

                                </label>

                                <p>

                                    {
                                        formatDateTime(
                                            selected.recordedAt
                                        )
                                    }

                                </p>

                            </div>

                            {/* TRAVEL DISTANCE */}

                            <div>

                                <label>

                                    <Navigation
                                        size={12}
                                    />

                                    Travel Distance

                                </label>

                                <p>

                                    {
                                        formatDistance(
                                            selected.totalDistance
                                        )
                                    }

                                </p>

                            </div>

                            {/* LAST LOCATION */}

                            <div>

                                <label>

                                    <Clock
                                        size={12}
                                    />

                                    Last Location

                                </label>

                                <p>

                                    {
                                        formatDateTime(
                                            selected
                                                ?.employeeId
                                                ?.lastLocationAt
                                    )}

                                </p>

                            </div>

                            {/* STATUS UPDATED */}

                            <div>

                                <label>

                                    <Clock
                                        size={12}
                                    />

                                    Status Updated

                                </label>

                                <p>

                                    {
                                        formatDateTime(
                                            selected
                                                ?.employeeId
                                                ?.statusUpdatedAt
                                    )}

                                </p>

                            </div>

                            {/* COORDINATES */}

                            <div className="lv-details-wide">

                                <label>

                                    <Navigation
                                        size={12}
                                    />

                                    Coordinates

                                </label>

                                <p>

                                    {
                                        selected.latitude
                                    }

                                    ,{" "}

                                    {
                                        selected.longitude
                                    }

                                </p>

                            </div>

                        </div>

                        {/* ACTION */}

                        <div
                            className="lv-action-group"
                            style={{
                                marginTop: 20,
                                justifyContent:
                                    "flex-end",
                            }}
                        >

                            <button
                                className="lv-btn lv-btn-approve"
                                onClick={() =>
                                    openMap(
                                        selected
                                    )
                                }
                            >

                                <Navigation
                                    size={14}
                                />

                                Open Google Maps

                            </button>

                        </div>

                        {/* CLOSE */}

                        <button
                            className="lv-modal-close"
                            onClick={() =>
                                setSelected(null)
                            }
                        >
                            Close
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}