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
  Clock,
  ArrowRight,
} from "lucide-react";

export default function ManagerNotificationsPage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);

  const managerId = user?.id || "MGR001";
  const managerNotifs = notifications.filter(
    (n) => !user || n.userId === managerId || n.userId === "MGR001" || n.userId === "ALL"
  );

  const [filter, setFilter] = useState("all");
  const filteredNotifs = managerNotifs.filter((n) => (filter === "unread" ? !n.read : true));
  const unreadCount = managerNotifs.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead(managerId));
    addToast("All notifications marked as read.", "info");
  };

  const handleClearAll = () => {
    if (confirm("Clear all notifications?")) {
      dispatch(clearAllNotifications(managerId));
      addToast("Cleared notification history.", "info");
    }
  };

  return (
    <DashboardLayout requiredRole="Manager">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
            <Bell size={24} color="var(--primary)" /> Manager Notifications
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Alerts for incoming team leave submissions and organizational updates.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
              Mark all read ({unreadCount})
            </Button>
          )}
          {managerNotifs.length > 0 && (
            <Button variant="ghost" size="sm" icon={Trash2} onClick={handleClearAll} style={{ color: "var(--danger)" }}>
              Clear all
            </Button>
          )}
        </div>
      </div>

      {filteredNotifs.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You have no notifications pending."
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
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AlertCircle size={18} color="var(--warning)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "700" }}>{n.title}</h4>
                    {!n.read && (
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--primary)", background: "var(--primary-light)", padding: "1px 6px", borderRadius: "4px" }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{n.message}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
                    <span><Clock size={12} /> {n.timestamp}</span>
                    {n.link && (
                      <Link href={n.link} onClick={() => dispatch(markAsRead(n.id))} style={{ color: "var(--primary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "2px" }}>
                        Review in Requests <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                {!n.read && (
                  <button type="button" onClick={() => dispatch(markAsRead(n.id))} className="btn btn-ghost btn-sm" style={{ color: "var(--primary)", fontSize: "12px" }}>
                    Mark read
                  </button>
                )}
                <button type="button" onClick={() => dispatch(clearNotification(n.id))} className="btn btn-ghost btn-sm" style={{ color: "var(--text-muted)" }}>
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
