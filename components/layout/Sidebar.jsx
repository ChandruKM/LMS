"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  CalendarDays,
  FilePlus2,
  History,
  Bell,
  User,
  Users,
  ShieldCheck,
  Wallet,
  ClipboardList,
  BarChart3,
  Settings,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  CheckSquare,
  Database,
} from "lucide-react";

export default function Sidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const { leaves } = useSelector((state) => state.leaves);
  const { notifications } = useSelector((state) => state.notifications);

  const role = user?.role || "Employee";

  // Compute pending requests for manager
  const pendingRequestsCount = leaves.filter((l) => l.status === "Pending").length;

  // Compute unread notifications
  const unreadNotifsCount = notifications.filter(
    (n) => (!user || n.userId === user.id) && !n.read
  ).length;

  // Nav menus per role according to specs
  const getNavLinks = () => {
    if (role === "Administrator") {
      return [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Employees", href: "/admin/employees", icon: Users },
        { label: "Leave Policies", href: "/admin/policies", icon: ShieldCheck },
        { label: "Leave Balances", href: "/admin/balances", icon: Wallet },
        { label: "Leave Records", href: "/admin/records", icon: ClipboardList },
        { label: "Calendar", href: "/admin/calendar", icon: CalendarDays },
        { label: "Reports", href: "/admin/reports", icon: BarChart3 },
        { label: "SQL Database", href: "/admin/database", icon: Database },
        { label: "Profile", href: "/admin/profile", icon: User },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ];
    }

    if (role === "Manager") {
      return [
        { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
        { label: "Apply Leave", href: "/manager/apply-leave", icon: FilePlus2 },
        {
          label: "Team Requests",
          href: "/manager/requests",
          icon: CheckSquare,
          badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
        },
        { label: "My Leave History", href: "/manager/history", icon: History },
        { label: "Team Calendar", href: "/manager/calendar", icon: CalendarDays },
        { label: "Team Reports", href: "/manager/reports", icon: BarChart3 },
        {
          label: "Notifications",
          href: "/manager/notifications",
          icon: Bell,
          badge: unreadNotifsCount > 0 ? unreadNotifsCount : null,
        },
        { label: "Profile", href: "/manager/profile", icon: User },
      ];
    }

    // Default: Employee
    return [
      { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
      { label: "Apply Leave", href: "/employee/apply-leave", icon: FilePlus2 },
      { label: "Leave History", href: "/employee/history", icon: History },
      { label: "Calendar", href: "/employee/calendar", icon: CalendarDays },
      {
        label: "Notifications",
        href: "/employee/notifications",
        icon: Bell,
        badge: unreadNotifsCount > 0 ? unreadNotifsCount : null,
      },
      { label: "Profile", href: "/employee/profile", icon: User },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <Link
          href={role === "Administrator" ? "/admin/dashboard" : `/${role.toLowerCase()}/dashboard`}
          className="sidebar-brand"
        >
          <div className="sidebar-brand-icon">
            <CalendarCheck2 size={20} />
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-title">ApexTech</span>
              <span className="sidebar-brand-sub">
                {role === "Administrator" ? "Admin Portal" : `${role} Portal`}
              </span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="topbar-toggle-btn"
          style={{ width: "28px", height: "28px" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        {!collapsed && <span className="nav-section-label">Main Navigation</span>}
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} />
              {!collapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
