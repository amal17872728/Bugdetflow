import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/userSlice";
import { useState } from "react";

const pageTitles = {
  '/dashboard':    'DASHBOARD',
  '/transactions': 'TRANSACTIONS',
  '/budget':       'BUDGET',
  '/support':      'SUPPORT',
  '/profile':      'PROFILE',
  '/contact':      'CONTACT',
};

const navLinks = [
  { to: "/dashboard",    label: "Home",         icon: "⌂"  },
  { to: "/transactions", label: "Analytics",    icon: "↑↓" },
  { to: "/budget",       label: "Budget",       icon: "$"  },
  { to: "/support",      label: "Support",      icon: "♡"  },
  { to: "/profile",      label: "Profile",      icon: "◉"  },
];

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

  const title = pageTitles[location.pathname] || "BUDGETFLOW";

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="topnav">
      {/* Page Title */}
      <span className="topnav-title">{title}</span>

      {/* Nav Pills */}
      <div className="topnav-links">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`topnav-pill${isActive(link.to) ? ' active' : ''}`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Right: Search + Logout */}
      <div className="topnav-right">
        <input
          className="topnav-search"
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="topnav-logout"
          onClick={() => dispatch(logout())}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
