"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import StatCard from "../../../components/dashboard/StatCard";
import QuickAction from "../../../components/dashboard/QuickAction";
import StatusBadge from "../../../components/common/StatusBadge";
import Button from "../../../components/common/Button";
import LeaveDetailsModal from "../../../components/leave/LeaveDetailsModal";
import LeaveRejectModal from "../../../components/leave/LeaveRejectModal";
import { approveLeave, rejectLeave } from "../../../redux/slices/leaveSlice";
import { deductBalance } from "../../../redux/slices/employeeSlice";
import { addNotification } from "../../../redux/slices/notificationSlice";
import { useToast } from "../../providers";
import {
  Users,
  Clock,
  CheckCircle2,
  CalendarDays,
  FileCheck2,
  BarChart3,
  AlertCircle,
  Eye,
  CheckSquare,
  XCircle,
  Calendar,
} from "lucide-react";

export default function ManagerDashboard() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { leaves } = useSelector((state) => state.leaves);
  const { employees } = useSelector((state) => state.employees);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectingLeave, setRejectingLeave] = useState(null);

  // Team members: In this demo, Robert Fox manages the team (EMP001 through EMP005)
  const teamMembers = employees.filter((e) => e.role === "Employee");
  const teamMemberIds = teamMembers.map((e) => e.id);

  // Team leaves
  const teamLeaves = leaves.filter((l) => teamMemberIds.includes(l.employeeId));

  const pendingRequests = teamLeaves.filter((l) => l.status === "Pending");
  const approvedLeaves = teamLeaves.filter((l) => l.status === "Approved");

  // Employees on leave today (Demo current date: 2026-10-05)
  const todayStr = "2026-10-05";
  const onLeaveToday = approvedLeaves.filter(
    (l) => todayStr >= l.startDate && todayStr <= l.endDate
  );

  const handleApprove = (leave) => {
    // 1. Approve leave
    dispatch(approveLeave({ id: leave.id, managerRemark: "Approved by manager." }));

    // 2. Reduce leave balance
    dispatch(
      deductBalance({
        employeeId: leave.employeeId,
        leaveType: leave.leaveType,
        days: leave.days,
      })
    );

    // 3. Notify employee
    dispatch(
      addNotification({
        userId: leave.employeeId,
        title: "Leave Approved",
        message: `Your ${leave.leaveType} request for ${leave.days} days (${leave.startDate} to ${leave.endDate}) has been approved by ${user?.name || "Robert Fox"}.`,
        type: "success",
        link: "/employee/history",
      })
    );

    addToast(`Approved leave request ${leave.id} for ${leave.employeeName}. Balance updated.`, "success");
    setSelectedLeave(null);
  };

  const handleConfirmReject = (leaveId, remark) => {
    const targetLeave = leaves.find((l) => l.id === leaveId);
    if (!targetLeave) return;

    dispatch(rejectLeave({ id: leaveId, managerRemark: remark }));

    dispatch(
      addNotification({
        userId: targetLeave.employeeId,
        title: "Leave Request Rejected",
        message: `Your ${targetLeave.leaveType} request was rejected by ${user?.name || "Manager"}. Remark: ${remark}`,
        type: "danger",
        link: "/employee/history",
      })
    );

    addToast(`Rejected leave request ${leaveId}. Employee notified.`, "info");
    setRejectingLeave(null);
  };

  return (
    <DashboardLayout requiredRole="Manager">
      {/* Welcome Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
          color: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          padding: "26px 32px",
          marginBottom: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "18px",
          boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
        }}
      >
        <div>
          <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.85, fontWeight: "600" }}>
            Manager Review Portal
          </span>
          <h2 style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px" }}>
            Welcome, {user?.name || "Manager"} 👋
          </h2>
          <p style={{ fontSize: "13px", opacity: 0.9, marginTop: "4px", maxWidth: "560px" }}>
            You have <strong>{pendingRequests.length} pending leave requests</strong> needing your review and decision.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/manager/apply-leave">
            <Button
              variant="secondary"
              style={{ background: "#FFFFFF", color: "var(--primary)", border: "none", fontWeight: "700" }}
            >
              Apply Leave
            </Button>
          </Link>
          <Link href="/manager/requests">
            <Button
              variant="ghost"
              icon={CheckSquare}
              style={{ color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.4)" }}
            >
              Review Requests ({pendingRequests.length})
            </Button>
          </Link>
          <Link href="/manager/calendar">
            <Button
              variant="ghost"
              icon={CalendarDays}
              style={{ color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.4)" }}
            >
              Team Calendar
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Team Members"
          value={teamMembers.length}
          subtext="Direct report employees"
          icon={Users}
          color="#2563EB"
        />
        <StatCard
          label="Pending Requests"
          value={pendingRequests.length}
          subtext="Requires approval or rejection"
          icon={Clock}
          color="#F59E0B"
        />
        <StatCard
          label="Approved Leaves"
          value={approvedLeaves.length}
          subtext="Active / finalized leaves"
          icon={CheckCircle2}
          color="#10B981"
        />
        <StatCard
          label="On Leave Today"
          value={onLeaveToday.length}
          subtext="Currently absent team members"
          icon={Calendar}
          color="#8B5CF6"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <QuickAction
          title="Apply for Leave"
          description="Submit your personal leave to Admin for approval"
          href="/manager/apply-leave"
          icon={CalendarDays}
          color="#8B5CF6"
        />
        <QuickAction
          title="Review Leave Requests"
          description="Approve or decline submissions with remarks"
          href="/manager/requests"
          icon={FileCheck2}
          color="#2563EB"
        />
        <QuickAction
          title="Team Calendar"
          description="Inspect team availability and leave clashes"
          href="/manager/calendar"
          icon={CalendarDays}
          color="#10B981"
        />
        <QuickAction
          title="Team Leave Reports"
          description="Analyze department utilization & trends"
          href="/manager/reports"
          icon={BarChart3}
          color="#F59E0B"
        />
      </div>

      {/* Employees on Leave Today Banner */}
      {onLeaveToday.length > 0 && (
        <div
          style={{
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderRadius: "var(--radius-lg)",
            padding: "18px 24px",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <Calendar size={20} color="#D97706" />
            <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#92400E" }}>
              Employees on Leave Today ({onLeaveToday.length})
            </h4>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {onLeaveToday.map((l) => (
              <div
                key={l.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #FCD34D",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <strong>{l.employeeName}</strong> &bull; {l.leaveType} ({l.startDate} to {l.endDate})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Requests Review Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Clock size={18} color="var(--warning)" /> Pending Leave Applications
            </h3>
            <p className="card-subtitle">
              Requests waiting for your decision. Approving will automatically deduct the employee's balance.
            </p>
          </div>
          <Link href="/manager/requests">
            <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}>All Requests &rarr;</span>
          </Link>
        </div>

        {pendingRequests.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <CheckCircle2 size={36} color="var(--success)" style={{ margin: "0 auto 10px" }} />
            <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>All caught up!</h4>
            <p style={{ fontSize: "13px" }}>There are no pending leave requests awaiting approval.</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: "700", fontSize: "13px" }}>{l.employeeName}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {l.employeeId} &bull; {l.department}
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: "13px" }}>{l.leaveType}</strong>
                    </td>
                    <td style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                      {l.startDate} <span style={{ color: "var(--text-muted)" }}>to</span> {l.endDate}
                    </td>
                    <td style={{ fontWeight: "700", color: "var(--primary)" }}>{l.days}d</td>
                    <td style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={l.reason}>
                      {l.reason}
                    </td>
                    <td>
                      <StatusBadge status={l.status} size="sm" />
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedLeave(l)}
                          title="View Details"
                        >
                          View
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(l)}
                          title="Approve this request"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setRejectingLeave(l)}
                          title="Reject this request"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
