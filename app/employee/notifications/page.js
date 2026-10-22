"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import {
  markAsRead,
  markAllAsRead,
  clearNotification,
  clearAllNotifications,
} from "../../../redux/slices/notificationSlice";
import { useToast } from "../../providers";
import Button from "../../../components/common/Button";
import EmptyState from "../../../components/common/EmptyState";
import {
  Bell,
  CheckCheck,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function EmployeeNotificationsPage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);

  const employeeId = user?.id || "EMP001";
  const myNotifications = notifications.filter(
    (n) => !user || n.userId === employeeId || n.userId === "ALL"
  );

  const [filter, setFilter] = useState("all"); // "all", "unread"

  const filteredNotifs = myNotifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const unreadCount = myNotifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead(employeeId));
    addToast("All notifications marked as read.", "info");
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      dispatch(clearAllNotifications(employeeId));
      addToast("Cleared notification history.", "info");
    }
  };

  const getIcon = (type) => {
    if (type === "success") return <CheckCircle2 size={18} color="var(--success)" />;
    if (type === "warning") return <AlertCircle size={18} color="var(--warning)" />;
    if (type === "danger") return <AlertCircle size={18} color="var(--danger)" />;
    return <Info size={18} color="var(--primary)" />;
  };

  return (
    <DashboardLayout requiredRole="Employee">
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
            <Bell size={24} color="var(--primary)" /> Notifications
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time status alerts for your leave requests, manager feedback, and schedule updates.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
              Mark all read ({unreadCount})
            </Button>
          )}
          {myNotifications.length > 0 && (
            <Button variant="ghost" size="sm" icon={Trash2} onClick={handleClearAll} style={{ color: "var(--danger)" }}>
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
        <button
          type="button"
          onClick={() => setFilter("all")}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            fontSize: "13px",
            fontWeight: "600",
            backgroundColor: filter === "all" ? "var(--primary)" : "#FFFFFF",
            color: filter === "all" ? "#FFFFFF" : "var(--text-secondary)",
            border: filter === "all" ? "none" : "1px solid var(--border)",
            cursor: "pointer",
          }}
        >
          All Notifications ({myNotifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            fontSize: "13px",
            fontWeight: "600",
            backgroundColor: filter === "unread" ? "var(--primary)" : "#FFFFFF",
            color: filter === "unread" ? "#FFFFFF" : "var(--text-secondary)",
            border: filter === "unread" ? "none" : "1px solid var(--border)",
            cursor: "pointer",
          }}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Bell}
            title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
            description="You are completely caught up! We will alert you whenever your manager acts on a request."
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
                borderLeft: !n.read ? "4px solid var(--primary)" : "1px solid var(--border)",
                backgroundColor: !n.read ? "#FBFDFF" : "#FFFFFF",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: 1 }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--background)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {getIcon(n.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          color: "var(--primary)",
                          background: "var(--primary-light)",
                          padding: "1px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: "1.4" }}>
                    {n.message}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} /> {n.timestamp}
                    </span>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => dispatch(markAsRead(n.id))}
                        style={{ color: "var(--primary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "2px" }}
                      >
                        View relevant request <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => dispatch(markAsRead(n.id))}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: "12px", color: "var(--primary)" }}
                    title="Mark as read"
                  >
                    Mark read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dispatch(clearNotification(n.id))}
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--text-muted)" }}
                  title="Remove notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
