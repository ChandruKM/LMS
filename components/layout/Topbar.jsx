"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { markAsRead, markAllAsRead } from "../../redux/slices/notificationSlice";
import { useToast } from "../../app/providers";
import {
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  CheckCheck,
  Menu,
  Shield,
} from "lucide-react";


export default function Topbar({ collapsed, setCollapsed }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [backendOnline, setBackendOnline] = useState(false);

  // Check backend server connection
  useEffect(() => {
    let isMounted = true;
    const checkBackend = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081/api";
        const res = await fetch(`${backendUrl}/health`, { cache: "no-store" });
        if (isMounted) setBackendOnline(res.ok);
      } catch {
        if (isMounted) setBackendOnline(false);
      }
    };
    checkBackend();
    const timer = setInterval(checkBackend, 10000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Filter user notifications
  const userNotifs = notifications.filter(
    (n) => !user || n.userId === user.id || user.role === "Administrator"
  );
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute Page Title and Breadcrumb from Path
  const getPageMeta = () => {
    const parts = pathname.split("/").filter(Boolean);
    const role = parts[0] || "Employee";
    const section = parts[1] || "dashboard";

    const titleMap = {
      dashboard: "Dashboard Overview",
      "apply-leave": "Apply for Leave",
      history: "Leave History & Status",
      calendar: "Leave Calendar",
      notifications: "Notifications",
      profile: "My Profile",
      requests: "Leave Approval Requests",
      reports: "Analytics & Reports",
      employees: "Employee Directory",
      policies: "Leave Policies & Rules",
      balances: "Leave Balances & Quota",
      records: "All Leave Records",
      settings: "System & Organization Settings",
    };

    return {
      roleText: role.charAt(0).toUpperCase() + role.slice(1),
      pageTitle: titleMap[section] || "Dashboard",
    };
  };

  const { roleText, pageTitle } = getPageMeta();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };


  return (
    <header className="topbar">
      {/* Left: Mobile collapse button + Breadcrumb */}
      <div className="topbar-left">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="topbar-toggle-btn"
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>
        <div className="topbar-page-info">
          <h1 className="topbar-title">{pageTitle}</h1>
          <span className="topbar-breadcrumb">
            {roleText} &rsaquo; {pageTitle}
          </span>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="topbar-center">
        <div className="topbar-search">
          <Search size={16} className="topbar-search-icon" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search leaves, employees, departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                const target = user?.role === "Administrator" ? "/admin/records" : "/employee/history";
                router.push(`${target}?q=${encodeURIComponent(searchQuery)}`);
              }
            }}
          />
        </div>
      </div>

      {/* Right: Role Badge + Notifications + Profile */}
      <div className="topbar-right">
        {/* Active Role Indicator (Strict - No switching without logout) */}
        <div
          style={{
            padding: "4px 10px",
            borderRadius: "9999px",
            fontSize: "11px",
            fontWeight: "700",
            backgroundColor: user?.role === "Administrator" ? "#FEF3C7" : user?.role === "Manager" ? "#EFF6FF" : "#ECFDF5",
            color: user?.role === "Administrator" ? "#B45309" : user?.role === "Manager" ? "#1D4ED8" : "#047857",
            border: `1px solid ${user?.role === "Administrator" ? "#FDE68A" : user?.role === "Manager" ? "#BFDBFE" : "#A7F3D0"}`,
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "currentColor" }} />
          {user?.role === "Administrator" ? "Admin Portal" : `${user?.role || "Employee"} Portal`}
        </div>

        {/* Backend Server Connection Indicator */}
        <div
          style={{
            padding: "4px 10px",
            borderRadius: "9999px",
            fontSize: "11px",
            fontWeight: "600",
            backgroundColor: backendOnline ? "#ECFDF5" : "#F3F4F6",
            color: backendOnline ? "#047857" : "#6B7280",
            border: `1px solid ${backendOnline ? "#A7F3D0" : "#E5E7EB"}`,
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
          title={backendOnline ? "Connected to Spring Boot Backend API (http://localhost:8081)" : "Backend offline. In terminal run: npm run backend (or double-click start-all.bat)"}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: backendOnline ? "#10B981" : "#9CA3AF",
            }}
          />
          {backendOnline ? "Backend: Connected (Port 8081)" : "Backend: Offline"}
        </div>


        {/* Notifications Icon & Dropdown */}
        <div className="topbar-user-menu" ref={notifRef}>
          <button
            type="button"
            className="topbar-action-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="topbar-notif-badge">{unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className="dropdown-menu notif-dropdown animate-fade-in">
              <div className="notif-dropdown-header">
                <span className="dropdown-header-title">Notifications ({unreadCount} new)</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: "11px", padding: "2px 6px" }}
                    onClick={() => {
                      dispatch(markAllAsRead(user?.id));
                      addToast("All notifications marked as read", "info");
                    }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div className="notif-dropdown-list">
                {userNotifs.length === 0 ? (
                  <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No notifications yet
                  </div>
                ) : (
                  userNotifs.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      className={`notif-dropdown-item ${!n.read ? "unread" : ""}`}
                      onClick={() => {
                        dispatch(markAsRead(n.id));
                        if (n.link) router.push(n.link);
                        setNotifOpen(false);
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div className="notif-dropdown-item-title">{n.title}</div>
                        <div className="notif-dropdown-item-msg">{n.message}</div>
                        <div className="notif-dropdown-item-time">{n.timestamp}</div>
                      </div>
                      {!n.read && (
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "var(--primary)",
                            marginTop: "6px",
                          }}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="notif-dropdown-footer">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ width: "100%", fontSize: "12px", color: "var(--primary)" }}
                  onClick={() => {
                    const target = user?.role === "Manager" ? "/manager/notifications" : "/employee/notifications";
                    router.push(target);
                    setNotifOpen(false);
                  }}
                >
                  View all notifications &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="topbar-user-menu" ref={userMenuRef}>
          <button
            type="button"
            className="topbar-user-trigger"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
              alt={user?.name || "User"}
              className="topbar-user-avatar"
            />
            <div className="topbar-user-meta">
              <span className="topbar-user-name">{user?.name || "Demo User"}</span>
              <span className="topbar-user-role">{user?.role || "Employee"}</span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {userMenuOpen && (
            <div className="dropdown-menu animate-fade-in">
              <div className="dropdown-header">
                <div className="dropdown-header-title">{user?.name}</div>
                <div className="dropdown-header-sub">{user?.email}</div>
              </div>

              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  const roleSlug = (user?.role || "employee").toLowerCase();
                  const target = roleSlug === "administrator" ? "/admin/profile" : `/${roleSlug}/profile`;
                  router.push(target);
                  setUserMenuOpen(false);
                }}
              >
                <User size={16} /> My Profile
              </button>

              <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />


              <button
                type="button"
                className="dropdown-item danger"
                onClick={handleLogout}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
