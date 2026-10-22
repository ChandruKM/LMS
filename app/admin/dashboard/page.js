"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import StatCard from "../../../components/dashboard/StatCard";
import QuickAction from "../../../components/dashboard/QuickAction";
import StatusBadge from "../../../components/common/StatusBadge";
import Button from "../../../components/common/Button";
import LeaveTrendChart from "../../../components/charts/LeaveTrendChart";
import LeaveTypeChart from "../../../components/charts/LeaveTypeChart";
import DepartmentChart from "../../../components/charts/DepartmentChart";
import EmployeeLeaveChart from "../../../components/charts/EmployeeLeaveChart";
import {
  Users,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  ShieldCheck,
  Wallet,
  Settings,
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  Building,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const { employees, balances } = useSelector((state) => state.employees);
  const { leaves } = useSelector((state) => state.leaves);
  const { policies } = useSelector((state) => state.policies);

  // Compute Org Metrics
  const totalEmployees = employees.length;
  const totalRequests = leaves.length;
  const pendingRequests = leaves.filter((l) => l.status === "Pending").length;
  const approvedRequests = leaves.filter((l) => l.status === "Approved").length;
  const rejectedRequests = leaves.filter((l) => l.status === "Rejected").length;

  // On leave today (Demo date 2026-10-05)
  const todayStr = "2026-10-05";
  const onLeaveToday = leaves.filter(
    (l) => l.status === "Approved" && todayStr >= l.startDate && todayStr <= l.endDate
  );

  // Leave type distribution (strictly registered leaves)
  const typeChartData = useMemo(() => {
    return policies
      .map((policy) => {
        const days = leaves
          .filter((l) => l.leaveType === policy.name && l.status === "Approved")
          .reduce((sum, l) => sum + (l.days || 0), 0);
        return {
          name: policy.name,
          value: days,
          color: policy.color || "#2563EB",
        };
      })
      .filter((p) => p.value > 0);
  }, [policies, leaves]);

  // Employee-wise Leave Usage strictly for registered non-admin staff
  const employeeChartData = useMemo(() => {
    const registeredStaff = employees.filter((e) => e.role !== "Administrator");
    return registeredStaff.map((emp) => {
      const empBalances = balances.filter((b) => b.employeeId === emp.id);
      const balanceUsed = empBalances.reduce((acc, b) => acc + (b.used || 0), 0);
      const balanceRemaining = empBalances.reduce((acc, b) => acc + (b.remaining || 0), 0);

      const approvedLeaveDays = leaves
        .filter(
          (l) =>
            (l.employeeId === emp.id || (emp.email && l.employeeEmail === emp.email)) &&
            l.status === "Approved"
        )
        .reduce((sum, l) => sum + (l.days || 0), 0);

      const totalEntitlement =
        empBalances.length > 0
          ? empBalances.reduce((acc, b) => acc + (b.entitlement || 0), 0)
          : policies.reduce((sum, p) => sum + (p.entitlement || 0), 0);

      const used = Math.max(balanceUsed, approvedLeaveDays);
      const remaining =
        balanceRemaining > 0
          ? balanceRemaining
          : Math.max(0, totalEntitlement - used);

      return {
        id: emp.id,
        fullName: emp.name,
        name: emp.name.length > 14 ? emp.name.slice(0, 13) + "…" : emp.name,
        used,
        remaining,
      };
    });
  }, [employees, balances, leaves, policies]);

  // Department-wise usage from registered departments and actual leaves
  const departmentChartData = useMemo(() => {
    const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
    const defaultDepts = ["Development", "HR", "Finance", "Marketing", "Operations"];
    const allDepts = departments.length > 0 ? departments : defaultDepts;

    return allDepts.map((dept) => {
      const approved = leaves
        .filter((l) => l.department === dept && l.status === "Approved")
        .reduce((sum, l) => sum + (l.days || 0), 0);
      const pending = leaves
        .filter((l) => l.department === dept && l.status === "Pending")
        .reduce((sum, l) => sum + (l.days || 0), 0);
      return {
        department: dept,
        approved,
        pending,
      };
    });
  }, [employees, leaves]);

  // Monthly Leave Trend from actual leaves
  const trendChartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: monthNames[d.getMonth()],
      });
    }

    return months.map((m) => {
      const monthLeaves = leaves.filter((l) => {
        const date = l.startDate || l.appliedDate || "";
        return date.startsWith(m.key);
      });
      return {
        month: m.label,
        leaves: monthLeaves.length,
        days: monthLeaves
          .filter((l) => l.status === "Approved")
          .reduce((sum, l) => sum + (l.days || 0), 0),
      };
    });
  }, [leaves]);

  return (
    <DashboardLayout requiredRole="Administrator">
      {/* Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          color: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          padding: "26px 32px",
          marginBottom: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "18px",
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.25)",
        }}
      >
        <div>
          <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#38BDF8", fontWeight: "700" }}>
            Executive HR & System Administration
          </span>
          <h2 style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px" }}>
            Administrator Control Center
          </h2>
          <p style={{ fontSize: "13px", opacity: 0.85, marginTop: "4px", maxWidth: "600px" }}>
            Oversee company-wide leave compliance, configure entitlements, manage staff quotas, and generate enterprise analytics.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/admin/employees">
            <Button
              variant="secondary"
              icon={Users}
              style={{ background: "#FFFFFF", color: "var(--text-main)", border: "none", fontWeight: "700" }}
            >
              Manage Employees
            </Button>
          </Link>
          <Link href="/admin/policies">
            <Button
              variant="ghost"
              icon={ShieldCheck}
              style={{ color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              Leave Policies
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Section 18 Organization Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Employees"
          value={totalEmployees}
          subtext="Active staff roster"
          icon={Users}
          color="#2563EB"
        />
        <StatCard
          label="Total Leave Requests"
          value={totalRequests}
          subtext="All-time recorded"
          icon={ClipboardList}
          color="#8B5CF6"
        />
        <StatCard
          label="Pending Approvals"
          value={pendingRequests}
          subtext="Awaiting manager action"
          icon={Clock}
          color="#F59E0B"
        />
        <StatCard
          label="Approved Requests"
          value={approvedRequests}
          subtext="Granted time-off"
          icon={CheckCircle2}
          color="#10B981"
        />
        <StatCard
          label="Rejected Requests"
          value={rejectedRequests}
          subtext="Declined with reasons"
          icon={XCircle}
          color="#EF4444"
        />
        <StatCard
          label="On Leave Today"
          value={onLeaveToday.length}
          subtext="Active absences today"
          icon={CalendarCheck}
          color="#06B6D4"
        />
      </div>

      {/* Quick Action Navigation */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <QuickAction
          title="Employees"
          description="Roster & staff directory"
          href="/admin/employees"
          icon={Users}
          color="#2563EB"
        />
        <QuickAction
          title="Leave Policies"
          description="Entitlements & rules"
          href="/admin/policies"
          icon={ShieldCheck}
          color="#10B981"
        />
        <QuickAction
          title="Leave Balances"
          description="Quota & manual adjustments"
          href="/admin/balances"
          icon={Wallet}
          color="#8B5CF6"
        />
        <QuickAction
          title="Leave Records"
          description="All applications log"
          href="/admin/records"
          icon={ClipboardList}
          color="#06B6D4"
        />
        <QuickAction
          title="Settings"
          description="Workdays & notifications"
          href="/admin/settings"
          icon={Settings}
          color="#F59E0B"
        />
      </div>

      {/* 4 Section 18 Organization Analytics Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px", marginBottom: "28px" }}>
        {/* Chart 1: Monthly Leave Trend */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={18} color="var(--primary)" /> Monthly Leave Trend
              </h3>
              <p className="card-subtitle">Organization-wide leave volume trajectory</p>
            </div>
          </div>
          <LeaveTrendChart data={trendChartData} />
        </div>

        {/* Chart 2: Leave Type Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <PieIcon size={18} color="var(--primary)" /> Leave Type Distribution
              </h3>
              <p className="card-subtitle">Share of approved leaves by category</p>
            </div>
          </div>
          <LeaveTypeChart data={typeChartData} />
        </div>

        {/* Chart 3: Department-wise Leave Usage */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Building size={18} color="var(--primary)" /> Department Leave Usage
              </h3>
              <p className="card-subtitle">Approved and pending leave distribution by department</p>
            </div>
          </div>
          <DepartmentChart data={departmentChartData} />
        </div>

        {/* Chart 4: Employee Leave Usage */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Users size={18} color="var(--primary)" /> Employee Leave Usage
              </h3>
              <p className="card-subtitle">Used days versus remaining quota balance</p>
            </div>
          </div>
          <EmployeeLeaveChart data={employeeChartData} />
        </div>
      </div>

      {/* Recent Leave Submissions Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Latest Organization Leave Records</h3>
            <p className="card-subtitle">Most recent leave requests across all departments</p>
          </div>
          <Link href="/admin/records">
            <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
              View All Records <ArrowRight size={14} />
            </span>
          </Link>
        </div>

        <div className="table-responsive" style={{ border: "none" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>Date Span</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.slice(0, 6).map((l) => (
                <tr key={l.id}>
                  <td>
                    <span style={{ fontWeight: "700", color: "var(--primary)", fontSize: "13px" }}>{l.id}</span>
                  </td>
                  <td>
                    <strong>{l.employeeName}</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{l.employeeId}</div>
                  </td>
                  <td>{l.department}</td>
                  <td>{l.leaveType}</td>
                  <td style={{ fontSize: "12px" }}>
                    {l.startDate} to {l.endDate}
                  </td>
                  <td style={{ fontWeight: "700" }}>{l.days}d</td>
                  <td>
                    <StatusBadge status={l.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
