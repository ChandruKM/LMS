"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import LeaveCalendar from "../../../components/leave/LeaveCalendar";
import LeaveDetailsModal from "../../../components/leave/LeaveDetailsModal";
import LeaveEditModal from "../../../components/leave/LeaveEditModal";
import LeaveCancelModal from "../../../components/leave/LeaveCancelModal";
import { CalendarDays, Filter } from "lucide-react";

export default function EmployeeCalendarPage() {
  const { user } = useSelector((state) => state.auth);
  const { leaves } = useSelector((state) => state.leaves);
  const { policies } = useSelector((state) => state.policies);

  const employeeId = user?.id || "EMP001";
  const myLeaves = leaves.filter((l) => l.employeeId === employeeId);

  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [editLeave, setEditLeave] = useState(null);
  const [cancelLeave, setCancelLeave] = useState(null);

  // Filter leaves
  const filteredLeaves = myLeaves.filter((l) => {
    if (statusFilter !== "All" && l.status !== statusFilter) return false;
    if (typeFilter !== "All" && l.leaveType !== typeFilter) return false;
    return true;
  });

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
          marginBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
            <CalendarDays size={24} color="var(--primary)" /> My Leave Calendar
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Monthly visual timeline of your approved vacation days, sick leaves, and pending requests.
          </p>
        </div>

        {/* Quick Filter Controls */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            className="form-control"
            style={{ width: "auto", fontSize: "13px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved Only</option>
            <option value="Pending">Pending Only</option>
          </select>

          <select
            className="form-control"
            style={{ width: "auto", fontSize: "13px" }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Leave Types</option>
            {policies.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <LeaveCalendar
        leaves={filteredLeaves}
        showEmployeeNames={false}
        onSelectLeave={(l) => setSelectedLeave(l)}
      />

      {/* Modals */}
      <LeaveDetailsModal
        leave={selectedLeave}
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        onEdit={(l) => setEditLeave(l)}
        onCancel={(l) => setCancelLeave(l)}
      />

      <LeaveEditModal
        leave={editLeave}
        isOpen={!!editLeave}
        onClose={() => setEditLeave(null)}
      />

      <LeaveCancelModal
        leave={cancelLeave}
        isOpen={!!cancelLeave}
        onClose={() => setCancelLeave(null)}
        onConfirmCancel={() => {}}
      />
    </DashboardLayout>
  );
}
