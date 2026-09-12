import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Menu, X, LogOut, ChevronDown, LayoutDashboard, PlusSquare, Building2,
  Inbox, ShieldCheck, Truck, UserRoundCheck, WifiOff, Users, CalendarOff,Phone,Trophy, Sparkles  
} from "lucide-react";
import "./Header.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/instant-assistant", label: "Instant Assistant", icon: Sparkles },
  {
    id: "properties", label: "Properties", icon: Building2,
    children: [
      { to: "/add-property", label: "Add Property", icon: PlusSquare },
      { to: "/view-property", label: "All Properties", icon: Building2 },
      { to: "/view-request", label: "Property Request", icon: Inbox },
      { to: "/shifting-request", label: "Shifting Request", icon: Truck },
       { to: "/findroom-request", label: "₹499 Slot Request", icon: Inbox },
    ],
  },
  { to: "/add-watchmen", label: "Watchmens", icon: ShieldCheck },
  // { to: "/move-request", label: "Shift Request", icon: Truck },
  { to: "/owner-request", label: "Owner Uploads", icon: UserRoundCheck },
  { to: "/offline-customers", label: "Call List", icon: Phone },
  {
    id: "employees-data", label: "Employees Data", icon: Users,
    children: [
      { to: "/emplyees", label: "Uploaded Properties", icon: Users },
      { to: "/leaves", label: "Leaves", icon: CalendarOff },
      { to: "/employee-performance", label: "Performance", icon: Trophy },
       { to: "/employee-location", label: "Location Tracking", icon: Users },

    ],
  },
];

function NavList({ expanded, onNavigate }) {
  const [open, setOpen] = useState({});
  const toggle = (id) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  return (
    <ul className="rb-nav">
      {NAV_ITEMS.map((item) =>
        item.children ? (
          <li key={item.id}>
            <button
              type="button"
              className="rb-nav__link rb-nav__group"
              aria-expanded={!!open[item.id]}
              onClick={() => toggle(item.id)}
            >
              <item.icon size={20} className="rb-ic" />
              <span className={`rb-label ${expanded ? "" : "rb-label--hidden"}`}>{item.label}</span>
              <ChevronDown
                size={16}
                className={`rb-chev ${open[item.id] ? "rb-chev--open" : ""} ${expanded ? "" : "rb-label--hidden"}`}
              />
            </button>
            <ul className={`rb-sub ${open[item.id] && expanded ? "rb-sub--open" : ""}`}>
              {item.children.map((c) => (
                <li key={c.to}>
                  <NavLink
                    to={c.to}
                    end
                    onClick={onNavigate}
                    className={({ isActive }) => `rb-sub__link ${isActive ? "is-active" : ""}`}
                  >
                    <c.icon size={16} className="rb-ic" />
                    <span>{c.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
        ) : (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end
              onClick={onNavigate}
              className={({ isActive }) => `rb-nav__link ${isActive ? "is-active" : ""}`}
            >
              <item.icon size={20} className="rb-ic" />
              <span className={`rb-label ${expanded ? "" : "rb-label--hidden"}`}>{item.label}</span>
            </NavLink>
          </li>
        )
      )}
    </ul>
  );
}

export default function Header({ onLogout }) {
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    if (onLogout) onLogout();
    else { localStorage.clear(); navigate("/login"); }
  };

  return (
    <>
      <aside
        className={`rb-rail ${hovered ? "rb-rail--open" : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="rb-brand">
          <div className="rb-brand__mark">RB</div>
          <span className={`rb-label ${hovered ? "" : "rb-label--hidden"}`}>RoomBuddy</span>
        </div>
        <nav className="rb-rail__nav"><NavList expanded={hovered} /></nav>
        <div className="rb-rail__foot">
          <button className="rb-logout" onClick={logout}>
            <LogOut size={20} />
            <span className={`rb-label ${hovered ? "" : "rb-label--hidden"}`}>Logout</span>
          </button>
        </div>
      </aside>

      <header className="rb-topbar">
        <div className="rb-brand">
          <div className="rb-brand__mark">RB</div>
          <span>RoomBuddy</span>
        </div>
        <button className="rb-icon-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
      </header>

      <div className={`rb-backdrop ${mobileOpen ? "rb-backdrop--show" : ""}`} onClick={() => setMobileOpen(false)} />
      <aside className={`rb-drawer ${mobileOpen ? "rb-drawer--open" : ""}`}>
        <div className="rb-drawer__head">
          <div className="rb-brand"><div className="rb-brand__mark">RB</div><span>RoomBuddy</span></div>
          <button className="rb-icon-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <nav className="rb-rail__nav"><NavList expanded onNavigate={() => setMobileOpen(false)} /></nav>
        <div className="rb-rail__foot">
          <button className="rb-logout rb-logout--full" onClick={logout}><LogOut size={20} /><span>Logout</span></button>
        </div>
      </aside>
    </>
  );
}
