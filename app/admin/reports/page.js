"use client";

import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import StatCard from "../../../components/dashboard/StatCard";
import LeaveTrendChart from "../../../components/charts/LeaveTrendChart";
import LeaveTypeChart from "../../../components/charts/LeaveTypeChart";
import DepartmentChart from "../../../components/charts/DepartmentChart";
import EmployeeLeaveChart from "../../../components/charts/EmployeeLeaveChart";
import Button from "../../../components/common/Button";
import { useToast } from "../../providers";
import {
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertOctagon,
  Calendar,
  Download,
  Filter,
  Building,
  Users,
  PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";

export default function AdminReportsPage() {
  const { addToast } = useToast();
  const { leaves } = useSelector((state) => state.leaves);
  const { employees, balances } = useSelector((state) => state.employees);
  const { policies } = useSelector((state) => state.policies);

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDateFilter, setStartDateFilter] = useState("");

  const departments = ["Development", "HR", "Finance", "Marketing", "Operations", "Management"];

  // Filtered dataset for dynamic stats calculation
  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      if (departmentFilter !== "All" && l.department !== departmentFilter) return false;
      if (employeeFilter !== "All" && l.employeeId !== employeeFilter) return false;
      if (typeFilter !== "All" && l.leaveType !== typeFilter) return false;
      if (statusFilter !== "All" && l.status !== statusFilter) return false;
      if (startDateFilter && l.startDate < startDateFilter) return false;
      return true;
    });
  }, [leaves, departmentFilter, employeeFilter, typeFilter, statusFilter, startDateFilter]);

  // Section 25: 6 Summary Cards
  const totalRequests = filteredLeaves.length;
  const approvedCount = filteredLeaves.filter((l) => l.status === "Approved").length;
  const pendingCount = filteredLeaves.filter((l) => l.status === "Pending").length;
  const rejectedCount = filteredLeaves.filter((l) => l.status === "Rejected").length;
  const cancelledCount = filteredLeaves.filter((l) => l.status === "Cancelled").length;
  const totalLeaveDays = filteredLeaves
    .filter((l) => l.status === "Approved")
    .reduce((sum, l) => sum + (l.days || 0), 0);

  // Chart 2: Type Distribution
  const typeData = useMemo(() => {
    return policies.map((p) => {
      const days = filteredLeaves
        .filter((l) => l.leaveType === p.name && l.status === "Approved")
        .reduce((sum, l) => sum + (l.days || 0), 0);
      return {
        name: p.name,
        value: days > 0 ? days : 1,
        color: p.color || "#2563EB",
      };
    });
  }, [policies, filteredLeaves]);

  // Chart 3: Department Usage
  const departmentData = useMemo(() => {
    return departments.map((dept) => {
      const approved = filteredLeaves
        .filter((l) => l.department === dept && l.status === "Approved")
        .reduce((sum, l) => sum + (l.days || 0), 0);
      const pending = filteredLeaves
        .filter((l) => l.department === dept && l.status === "Pending")
        .reduce((sum, l) => sum + (l.days || 0), 0);
      return {
        department: dept,
        approved,
        pending,
      };
    });
  }, [departments, filteredLeaves]);

  // Chart 4: Employee-wise Leave Usage (strictly registered employees)
  const employeeData = useMemo(() => {
    const registeredStaff = employees
      .filter((e) => e.role !== "Administrator")
      .filter(
        (e) => employeeFilter === "All" || e.name === employeeFilter || e.id === employeeFilter
      );

    return registeredStaff.map((emp) => {
      const empBalances = balances.filter((b) => b.employeeId === emp.id);
      const balanceUsed = empBalances.reduce((acc, b) => acc + (b.used || 0), 0);
      const balanceRemaining = empBalances.reduce((acc, b) => acc + (b.remaining || 0), 0);

      const approvedLeaveDays = filteredLeaves
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
  }, [employees, balances, filteredLeaves, employeeFilter, policies]);

  const handleExport = () => {
    addToast("Compiling master executive report into spreadsheet format...", "info");
    setTimeout(() => {
      const headers = "Request ID,Employee,Department,Leave Type,Start Date,End Date,Days,Status,Applied Date\n";
      const rows = filteredLeaves
        .map((l) => `"${l.id}","${l.employeeName}","${l.department}","${l.leaveType}","${l.startDate}","${l.endDate}",${l.days},"${l.status}","${l.appliedDate}"`)
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Executive_Leave_Analytics_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast("Executive Leave Analytics Report exported successfully.", "success");
    }, 800);
  };

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
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
            <BarChart3 size={24} color="var(--primary)" /> Executive Reports & Analytics
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Organizational metrics, department utilization distributions, employee quotas, and trend forecasting.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Download} onClick={handleExport}>
          Export Master Report
        </Button>
      </div>

      {/* Filter Ribbon */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
            <Filter size={16} color="var(--primary)" /> Filters:
          </div>

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

          <select
            className="form-control"
            style={{ width: "auto", fontSize: "13px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>From:</span>
            <input
              type="date"
              className="form-control"
              style={{ width: "auto", padding: "6px 10px", fontSize: "13px" }}
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
            />
          </div>

          {(departmentFilter !== "All" || employeeFilter !== "All" || typeFilter !== "All" || statusFilter !== "All" || startDateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDepartmentFilter("All");
                setEmployeeFilter("All");
                setTypeFilter("All");
                setStatusFilter("All");
                setStartDateFilter("");
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* 6 Section 25 Summary Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <StatCard
          label="Total Requests"
          value={totalRequests}
          subtext="In current filter"
          icon={CalendarCheck2}
          color="#2563EB"
        />
        <StatCard
          label="Approved"
          value={approvedCount}
          subtext="Finalized leaves"
          icon={CheckCircle2}
          color="#10B981"
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          subtext="Under manager review"
          icon={Clock}
          color="#F59E0B"
        />
        <StatCard
          label="Rejected"
          value={rejectedCount}
          subtext="Declined requests"
          icon={XCircle}
          color="#EF4444"
        />
        <StatCard
          label="Cancelled"
          value={cancelledCount}
          subtext="Employee withdrawals"
          icon={AlertOctagon}
          color="#64748B"
        />
        <StatCard
          label="Total Leave Days"
          value={`${totalLeaveDays} Days`}
          subtext="Approved leave volume"
          icon={Calendar}
          color="#8B5CF6"
        />
      </div>

      {/* 4 Section 25 Analytics Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: "24px", marginBottom: "28px" }}>
        {/* Chart 1: Monthly Leave Trend */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={18} color="var(--primary)" /> Chart 1: Monthly Leave Trend
              </h3>
              <p className="card-subtitle">Volume of leave requests & approved days trajectory</p>
            </div>
          </div>
          <LeaveTrendChart />
        </div>

        {/* Chart 2: Leave Type Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <PieIcon size={18} color="var(--primary)" /> Chart 2: Leave Type Distribution
              </h3>
              <p className="card-subtitle">Share of approved leaves by policy category</p>
            </div>
          </div>
          <LeaveTypeChart data={typeData} />
        </div>

        {/* Chart 3: Department-wise Leave Usage */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Building size={18} color="var(--primary)" /> Chart 3: Department-wise Leave Usage
              </h3>
              <p className="card-subtitle">Comparison between approved days vs pending requests per department</p>
            </div>
          </div>
          <DepartmentChart data={departmentData} />
        </div>

        {/* Chart 4: Employee-wise Leave Usage */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Users size={18} color="var(--primary)" /> Chart 4: Employee-wise Leave Usage
              </h3>
              <p className="card-subtitle">Utilized quota vs remaining days balance</p>
            </div>
          </div>
          <EmployeeLeaveChart data={employeeData} />
        </div>
      </div>
    </DashboardLayout>
  );
}
