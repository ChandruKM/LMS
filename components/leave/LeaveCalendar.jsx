"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";

export default function LeaveCalendar({
  leaves = [],
  showEmployeeNames = false,
  onSelectLeave,
}) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // Default Oct 2026 for demo data
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayEvents(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayEvents(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 9, 5)); // Demo current date Oct 5, 2026
    setSelectedDayEvents(null);
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarDays.push({
      day,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarDays.push({
      day,
      dateStr,
      isCurrentMonth: true,
      isToday: day === 5 && month === 9 && year === 2026,
    });
  }

  // Next month leading days
  const totalSlots = Math.ceil(calendarDays.length / 7) * 7;
  const remainingSlots = totalSlots - calendarDays.length;
  for (let day = 1; day <= remainingSlots; day++) {
    const dateStr = `${year}-${String(month + 2).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarDays.push({
      day,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // Helper to find leaves that span a specific date
  const getLeavesForDate = (dateStr) => {
    return leaves.filter((leave) => {
      if (leave.status === "Cancelled") return false;
      return dateStr >= leave.startDate && dateStr <= leave.endDate;
    });
  };

  const getEventBadgeColor = (status, leaveType) => {
    if (status === "Approved") return { bg: "#DCFCE7", text: "#15803D", border: "#BBF7D0" };
    if (status === "Pending") return { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" };
    if (status === "Rejected") return { bg: "#FEE2E2", text: "#B91C1C", border: "#FECACA" };
    return { bg: "#F1F5F9", text: "#64748B", border: "#E2E8F0" };
  };

  return (
    <div className="calendar-container">
      {/* Header controls */}
      <div className="calendar-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="calendar-month-title">
              {monthNames[month]} {year}
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {leaves.filter((l) => l.status !== "Cancelled").length} Scheduled Leaves in view
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button variant="secondary" size="sm" onClick={handleToday}>
            Today
          </Button>
          <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{ padding: "6px 10px", background: "#FFFFFF", borderRight: "1px solid var(--border)", display: "flex", alignItems: "center" }}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              style={{ padding: "6px 10px", background: "#FFFFFF", display: "flex", alignItems: "center" }}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap", fontSize: "12px", color: "var(--text-secondary)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#16A34A" }} />
          Approved Leave
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#F59E0B" }} />
          Pending Request
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--primary)" }} />
          Today's Date
        </span>
      </div>

      {/* Calendar Days Header */}
      <div className="calendar-grid">
        {daysOfWeek.map((d) => (
          <div key={d} className="calendar-day-header">
            {d}
          </div>
        ))}

        {/* Calendar Day Cells */}
        {calendarDays.map((cell, idx) => {
          const dayLeaves = getLeavesForDate(cell.dateStr);

          return (
            <div
              key={idx}
              className={`calendar-day-cell ${!cell.isCurrentMonth ? "other-month" : ""} ${
                cell.isToday ? "today" : ""
              }`}
              onClick={() => {
                if (dayLeaves.length > 0) {
                  setSelectedDayEvents({ date: cell.dateStr, leaves: dayLeaves });
                }
              }}
              style={{ cursor: dayLeaves.length > 0 ? "pointer" : "default" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="calendar-day-num">{cell.day}</span>
                {dayLeaves.length > 2 && (
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600" }}>
                    +{dayLeaves.length - 2}
                  </span>
                )}
              </div>

              {/* Event pills inside day */}
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", overflow: "hidden" }}>
                {dayLeaves.slice(0, 2).map((leave) => {
                  const style = getEventBadgeColor(leave.status);
                  return (
                    <div
                      key={leave.id}
                      className="calendar-event-pill"
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                        border: `1px solid ${style.border}`,
                      }}
                      title={`${showEmployeeNames ? leave.employeeName + " - " : ""}${leave.leaveType} (${leave.status})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectLeave) onSelectLeave(leave);
                      }}
                    >
                      {showEmployeeNames && <strong>{leave.employeeName.split(" ")[0]}: </strong>}
                      {leave.leaveType.split(" ")[0]}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Leave Drawer/Summary */}
      {selectedDayEvents && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            borderRadius: "var(--radius-md)",
            background: "var(--background)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700" }}>
              Leaves on {selectedDayEvents.date} ({selectedDayEvents.leaves.length})
            </h4>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDayEvents(null)}>
              Dismiss
            </Button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
            {selectedDayEvents.leaves.map((l) => (
              <div
                key={l.id}
                style={{
                  background: "#FFFFFF",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                }}
                onClick={() => onSelectLeave && onSelectLeave(l)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "13px" }}>{l.employeeName}</span>
                  <StatusBadge status={l.status} size="sm" />
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {l.leaveType} &bull; {l.days} {l.days === 1 ? "day" : "days"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  {l.startDate} to {l.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
