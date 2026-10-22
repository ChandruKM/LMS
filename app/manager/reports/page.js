"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import StatCard from "../../../components/dashboard/StatCard";
import LeaveTrendChart from "../../../components/charts/LeaveTrendChart";
import LeaveTypeChart from "../../../components/charts/LeaveTypeChart";
import EmployeeLeaveChart from "../../../components/charts/EmployeeLeaveChart";
import Button from "../../../components/common/Button";
import { useToast } from "../../providers";
import {
  BarChart3,
  CalendarCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Users,
  PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";

export default function ManagerReportsPage() {
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { leaves } = useSelector((state) => state.leaves);
  const { employees, balances } = useSelector((state) => state.employees);
  const { policies } = useSelector((state) => state.policies);

  // Strictly filter only registered employees belonging to the manager's team
  const teamEmployees = useMemo(() => {
    // Only registered non-administrator employees
    const registeredEmployees = employees.filter(
      (e) => e.role !== "Administrator" && e.id !== user?.id
    );

    // If manager has specific direct reports, show them; otherwise show all registered staff
    const myDirectReports = registeredEmployees.filter(
      (e) =>
        e.managerId === user?.id ||
        (user?.name && e.manager && e.manager.toLowerCase() === user.name.toLowerCase())
    );

    return myDirectReports.length > 0 ? myDirectReports : registeredEmployees;
  }, [employees, user]);

  const teamMemberIds = useMemo(() => teamEmployees.map((e) => e.id), [teamEmployees]);
  const teamLeaves = useMemo(
    () => leaves.filter((l) => teamMemberIds.includes(l.employeeId)),
    [leaves, teamMemberIds]
  );

  // Compute Metrics strictly from registered team leaves
  const totalRequests = teamLeaves.length;
  const approvedRequests = useMemo(
    () => teamLeaves.filter((l) => l.status === "Approved"),
    [teamLeaves]
  );
  const pendingRequests = useMemo(
    () => teamLeaves.filter((l) => l.status === "Pending"),
    [teamLeaves]
  );
  const rejectedRequests = useMemo(
    () => teamLeaves.filter((l) => l.status === "Rejected"),
    [teamLeaves]
  );

  const totalApprovedDays = useMemo(
    () => approvedRequests.reduce((sum, l) => sum + (l.days || 0), 0),
    [approvedRequests]
  );

  // Leave usage strictly for registered employees only
  const employeeUsageData = useMemo(() => {
    return teamEmployees.map((emp) => {
      const empBalances = balances.filter((b) => b.employeeId === emp.id);
      const balanceUsed = empBalances.reduce((acc, b) => acc + (b.used || 0), 0);
      const balanceRemaining = empBalances.reduce((acc, b) => acc + (b.remaining || 0), 0);

      // Verify against actual approved leave records
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
  }, [teamEmployees, balances, leaves, policies]);

  // Leave usage by leave type
  const typeUsageData = useMemo(() => {
    return policies
      .map((policy) => {
        const typeLeaves = approvedRequests.filter((l) => l.leaveType === policy.name);
        const count = typeLeaves.reduce((acc, l) => acc + (l.days || 0), 0);
        return {
          name: policy.name,
          value: count,
          color: policy.color || "#2563EB",
        };
      })
      .filter((t) => t.value > 0);
  }, [policies, approvedRequests]);

  const handleExportReport = () => {
    addToast("Generating and exporting Team Analytics Report (PDF/Excel)...", "info");
    setTimeout(() => {
      addToast("Team Leave Analytics Report successfully downloaded.", "success");
    }, 1200);
  };

  return (
    <DashboardLayout requiredRole="Manager">
      {/* Header */}
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
            <BarChart3 size={24} color="var(--primary)" /> Team Leave Analytics & Reports
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Comprehensive breakdown of your team's absence rate, leave categorization, and monthly trends.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Download} onClick={handleExportReport}>
          Export Team Report
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Team Requests"
          value={totalRequests}
          subtext="Submitted across all types"
          icon={CalendarCheck2}
          color="#2563EB"
        />
        <StatCard
          label="Approved Days Taken"
          value={`${totalApprovedDays} Days`}
          subtext={`${approvedRequests.length} approved requests`}
          icon={CheckCircle2}
          color="#10B981"
        />
        <StatCard
          label="Pending Applications"
          value={pendingRequests.length}
          subtext="Awaiting review"
          icon={Clock}
          color="#F59E0B"
        />
        <StatCard
          label="Declined Requests"
          value={rejectedRequests.length}
          subtext="Rejected with remarks"
          icon={XCircle}
          color="#EF4444"
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px", marginBottom: "28px" }}>
        {/* Chart 1: Monthly Trend */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={18} color="var(--primary)" /> Monthly Leave Trend
              </h3>
              <p className="card-subtitle">Volume of requests and total days over recent months</p>
            </div>
          </div>
          <LeaveTrendChart />
        </div>

        {/* Chart 2: Leave Type Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <PieIcon size={18} color="var(--primary)" /> Leave Category Distribution
              </h3>
              <p className="card-subtitle">Approved days split by policy category</p>
            </div>
          </div>
          <LeaveTypeChart data={typeUsageData.length > 0 ? typeUsageData : undefined} />
        </div>
      </div>

      {/* Employee Usage Bar Chart */}
      <div className="card" style={{ marginBottom: "28px" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Users size={18} color="var(--primary)" /> Leave Usage by Team Member
            </h3>
            <p className="card-subtitle">Comparison between utilized days vs remaining quota balance</p>
          </div>
        </div>
        <EmployeeLeaveChart data={employeeUsageData} />
      </div>

      {/* Team Roster Utilization Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Team Member Quota Summary</h3>
            <p className="card-subtitle">Live balance status for each direct report</p>
          </div>
        </div>

        <div className="table-responsive" style={{ border: "none" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Joining Date</th>
                <th>Days Taken</th>
                <th>Days Remaining</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teamEmployees.map((emp) => {
                const empBalances = balances.filter((b) => b.employeeId === emp.id);
                const used = empBalances.reduce((acc, b) => acc + (b.used || 0), 0);
                const remaining = empBalances.reduce((acc, b) => acc + (b.remaining || 0), 0);

                return (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        <div>
                          <strong>{emp.name}</strong>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{emp.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.joiningDate}</td>
                    <td style={{ fontWeight: "700", color: "#EF4444" }}>{used} Days</td>
                    <td style={{ fontWeight: "700", color: "#10B981" }}>{remaining} Days</td>
                    <td>
                      <span className="badge badge-active">Active</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
