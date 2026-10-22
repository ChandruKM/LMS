"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import StatCard from "../../../components/dashboard/StatCard";
import QuickAction from "../../../components/dashboard/QuickAction";
import StatusBadge from "../../../components/common/StatusBadge";
import Button from "../../../components/common/Button";
import LeaveDetailsModal from "../../../components/leave/LeaveDetailsModal";
import LeaveCancelModal from "../../../components/leave/LeaveCancelModal";
import LeaveEditModal from "../../../components/leave/LeaveEditModal";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FilePlus2,
  History,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Eye,
  CalendarCheck,
  Award,
} from "lucide-react";

export default function EmployeeDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { leaves } = useSelector((state) => state.leaves);
  const { balances } = useSelector((state) => state.employees);
  const { policies } = useSelector((state) => state.policies);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [editLeave, setEditLeave] = useState(null);
  const [cancelLeave, setCancelLeave] = useState(null);

  const employeeId = user?.id || "EMP001";

  // Filter leaves for this employee
  const myLeaves = leaves.filter((l) => l.employeeId === employeeId);

  // Compute Statistics
  const myBalances = balances.filter((b) => b.employeeId === employeeId);
  const totalRemainingBalance = myBalances.reduce((acc, curr) => acc + (curr.remaining || 0), 0);
  const totalUsedBalance = myBalances.reduce((acc, curr) => acc + (curr.used || 0), 0);

  const pendingLeaves = myLeaves.filter((l) => l.status === "Pending");
  const approvedLeaves = myLeaves.filter((l) => l.status === "Approved");

  // Find Upcoming Leave (next approved leave starting >= current date 2026-10-05)
  const todayStr = "2026-10-05";
  const upcomingLeave = approvedLeaves
    .filter((l) => l.startDate >= todayStr)
    .sort((a, b) => (a.startDate > b.startDate ? 1 : -1))[0];

  return (
    <DashboardLayout requiredRole="Employee">
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
            Employee Self-Service Portal
          </span>
          <h2 style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px" }}>
            Hello, {user?.name || "Employee"}! 👋
          </h2>
          <p style={{ fontSize: "13px", opacity: 0.9, marginTop: "4px", maxWidth: "520px" }}>
            Department: <strong>{user?.department}</strong> &bull; Manager: <strong>{user?.manager}</strong>. Check your available balances and apply for time-off seamlessly.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/employee/apply-leave">
            <Button
              variant="secondary"
              icon={FilePlus2}
              style={{ background: "#FFFFFF", color: "var(--primary)", border: "none", fontWeight: "700" }}
            >
              Apply for Leave
            </Button>
          </Link>
          <Link href="/employee/calendar">
            <Button
              variant="ghost"
              icon={CalendarDays}
              style={{ color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.4)" }}
            >
              View Calendar
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Leave Balance"
          value={`${totalRemainingBalance} Days`}
          subtext="Available across all policies"
          icon={CalendarCheck}
          color="#2563EB"
        />
        <StatCard
          label="Used Leave"
          value={`${totalUsedBalance} Days`}
          subtext="Utilized this calendar year"
          icon={TrendingDown}
          color="#EF4444"
        />
        <StatCard
          label="Pending Requests"
          value={pendingLeaves.length}
          subtext="Awaiting manager approval"
          icon={Clock}
          color="#F59E0B"
        />
        <StatCard
          label="Approved Leaves"
          value={approvedLeaves.length}
          subtext="Granted time-off requests"
          icon={CheckCircle2}
          color="#10B981"
        />
      </div>

      {/* Quick Actions Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <QuickAction
          title="Apply New Leave"
          description="Submit a vacation, sick, or casual leave request"
          href="/employee/apply-leave"
          icon={FilePlus2}
          color="#2563EB"
        />
        <QuickAction
          title="Leave History"
          description="View past requests, statuses, and remarks"
          href="/employee/history"
          icon={History}
          color="#10B981"
        />
        <QuickAction
          title="Company Calendar"
          description="Inspect scheduled leaves and holidays"
          href="/employee/calendar"
          icon={CalendarDays}
          color="#8B5CF6"
        />
      </div>

      {/* Upcoming Leave Card (if any approved future leave exists) */}
      {upcomingLeave && (
        <div
          style={{
            background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
            border: "1px solid #A7F3D0",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                background: "#10B981",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarCheck size={26} />
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#065F46" }}>
                Upcoming Approved Leave
              </span>
              <h4 style={{ fontSize: "17px", fontWeight: "700", color: "#064E3B", margin: "2px 0" }}>
                {upcomingLeave.leaveType} ({upcomingLeave.days} {upcomingLeave.days === 1 ? "day" : "days"})
              </h4>
              <p style={{ fontSize: "13px", color: "#047857" }}>
                Dates: <strong>{upcomingLeave.startDate}</strong> to <strong>{upcomingLeave.endDate}</strong> &bull; Reason: {upcomingLeave.reason}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedLeave(upcomingLeave)}
            style={{ borderColor: "#6EE7B7", background: "#FFFFFF", color: "#065F46" }}
          >
            View Details
          </Button>
        </div>
      )}

      {/* Balances by Type & Recent Requests Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        {/* Leave Balances Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Leave Entitlement Quota</h3>
              <p className="card-subtitle">Your allocated balance for each leave category</p>
            </div>
            <Link href="/employee/apply-leave">
              <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}>Apply &rarr;</span>
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {myBalances.map((b) => {
              const policy = policies.find((p) => p.name === b.leaveType);
              const color = policy?.color || "var(--primary)";
              const percent = b.entitlement > 0 ? Math.round((b.used / b.entitlement) * 100) : 0;

              return (
                <div
                  key={b.leaveType}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: color,
                        }}
                      />
                      <span style={{ fontSize: "13px", fontWeight: "600" }}>{b.leaveType}</span>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      <strong style={{ color: "var(--text-main)" }}>{b.remaining}</strong> / {b.entitlement} left
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      height: "6px",
                      borderRadius: "9999px",
                      background: "#E2E8F0",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(100, percent)}%`,
                        background: color,
                        borderRadius: "9999px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                    <span>{b.used} days taken</span>
                    <span>{percent}% utilized</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Leave Requests Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Leave Requests</h3>
              <p className="card-subtitle">Latest applications and their current status</p>
            </div>
            <Link href="/employee/history">
              <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}>All History &rarr;</span>
            </Link>
          </div>

          {myLeaves.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No leave requests submitted yet.
            </div>
          ) : (
            <div className="table-responsive" style={{ border: "none" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.slice(0, 5).map((l) => (
                    <tr key={l.id}>
                      <td>
                        <strong style={{ fontSize: "13px" }}>{l.leaveType}</strong>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{l.id}</div>
                      </td>
                      <td style={{ fontSize: "12px" }}>
                        {l.startDate}
                        <br />
                        <span style={{ color: "var(--text-muted)" }}>to {l.endDate}</span>
                      </td>
                      <td style={{ fontWeight: "600" }}>{l.days}d</td>
                      <td>
                        <StatusBadge status={l.status} size="sm" />
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedLeave(l)}
                          title="View details"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
        onConfirmCancel={(id) => {
          // Dispatch action
        }}
      />
    </DashboardLayout>
  );
}
