"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import LeaveCalendar from "../../../components/leave/LeaveCalendar";
import LeaveDetailsModal from "../../../components/leave/LeaveDetailsModal";
import { CalendarDays, Filter } from "lucide-react";

export default function AdminCalendarPage() {
  const { leaves } = useSelector((state) => state.leaves);
  const { employees } = useSelector((state) => state.employees);
  const { policies } = useSelector((state) => state.policies);

  const [statusFilter, setStatusFilter] = useState("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [selectedLeave, setSelectedLeave] = useState(null);

  const departments = ["Development", "HR", "Finance", "Marketing", "Operations", "Management"];

  const filteredLeaves = leaves.filter((l) => {
    if (statusFilter !== "All" && l.status !== statusFilter) return false;
    if (employeeFilter !== "All" && l.employeeId !== employeeFilter) return false;
    if (departmentFilter !== "All" && l.department !== departmentFilter) return false;
    if (typeFilter !== "All" && l.leaveType !== typeFilter) return false;
    return true;
  });

  return (
    <DashboardLayout requiredRole="Administrator">
      {/* Header */}
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
            <CalendarDays size={24} color="var(--primary)" /> Organization Master Calendar
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Company-wide timeline showing planned absences across all teams, departments, and policy categories.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <select
            className="form-control"
            style={{ width: "auto", fontSize: "13px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            className="form-control"
            style={{ width: "auto", fontSize: "13px" }}
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            className="form-control"
            style={{ width: "auto", fontSize: "13px" }}
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="All">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
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
        showEmployeeNames={true}
        onSelectLeave={(l) => setSelectedLeave(l)}
      />

      {/* Details Modal */}
      <LeaveDetailsModal
        leave={selectedLeave}
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
      />
    </DashboardLayout>
  );
}
