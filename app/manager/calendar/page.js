"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import LeaveCalendar from "../../../components/leave/LeaveCalendar";
import LeaveDetailsModal from "../../../components/leave/LeaveDetailsModal";
import LeaveRejectModal from "../../../components/leave/LeaveRejectModal";
import { approveLeave, rejectLeave } from "../../../redux/slices/leaveSlice";
import { deductBalance } from "../../../redux/slices/employeeSlice";
import { addNotification } from "../../../redux/slices/notificationSlice";
import { useToast } from "../../providers";
import { CalendarDays, Filter, Users } from "lucide-react";

export default function ManagerCalendarPage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { leaves } = useSelector((state) => state.leaves);
  const { employees } = useSelector((state) => state.employees);
  const { policies } = useSelector((state) => state.policies);

  const [statusFilter, setStatusFilter] = useState("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectingLeave, setRejectingLeave] = useState(null);

  // Departments list
  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));

  // Filter team leaves
  const teamMemberIds = employees.filter((e) => e.role === "Employee").map((e) => e.id);
  const teamLeaves = leaves.filter((l) => teamMemberIds.includes(l.employeeId));

  const filteredLeaves = teamLeaves.filter((l) => {
    if (statusFilter !== "All" && l.status !== statusFilter) return false;
    if (employeeFilter !== "All" && l.employeeId !== employeeFilter) return false;
    if (departmentFilter !== "All" && l.department !== departmentFilter) return false;
    if (typeFilter !== "All" && l.leaveType !== typeFilter) return false;
    return true;
  });

  const handleApprove = (leave) => {
    dispatch(approveLeave({ id: leave.id, managerRemark: "Approved by manager." }));
    dispatch(deductBalance({ employeeId: leave.employeeId, leaveType: leave.leaveType, days: leave.days }));
    dispatch(
      addNotification({
        userId: leave.employeeId,
        title: "Leave Approved",
        message: `Your ${leave.leaveType} has been approved by ${user?.name || "Manager"}.`,
        type: "success",
        link: "/employee/history",
      })
    );
    addToast("Approved leave request.", "success");
    setSelectedLeave(null);
  };

  const handleConfirmReject = (leaveId, remark) => {
    dispatch(rejectLeave({ id: leaveId, managerRemark: remark }));
    addToast("Rejected leave request.", "info");
    setRejectingLeave(null);
    setSelectedLeave(null);
  };

  return (
    <DashboardLayout requiredRole="Manager">
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
            <CalendarDays size={24} color="var(--primary)" /> Team Leave Calendar
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Monitor team schedule, track availability, and prevent resource bottlenecks during sprint milestones.
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
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            className="form-control"
            style={{ width: "auto", fontSize: "13px" }}
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="All">All Team Members</option>
            {employees.filter((e) => e.role === "Employee").map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
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

      {/* Team Calendar Grid */}
      <LeaveCalendar
        leaves={filteredLeaves}
        showEmployeeNames={true}
        onSelectLeave={(l) => setSelectedLeave(l)}
      />

      {/* Modals */}
      <LeaveDetailsModal
        leave={selectedLeave}
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        canManage={true}
        onApprove={handleApprove}
        onReject={(l) => setRejectingLeave(l)}
      />

      <LeaveRejectModal
        leave={rejectingLeave}
        isOpen={!!rejectingLeave}
        onClose={() => setRejectingLeave(null)}
        onConfirmReject={handleConfirmReject}
      />
    </DashboardLayout>
  );
}
