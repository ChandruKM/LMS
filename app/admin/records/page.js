"use client";

import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import StatusBadge from "../../../components/common/StatusBadge";
import Button from "../../../components/common/Button";
import SearchBar from "../../../components/common/SearchBar";
import EmptyState from "../../../components/common/EmptyState";
import LeaveDetailsModal from "../../../components/leave/LeaveDetailsModal";
import LeaveRejectModal from "../../../components/leave/LeaveRejectModal";
import { approveLeave, rejectLeave } from "../../../redux/slices/leaveSlice";
import { deductBalance } from "../../../redux/slices/employeeSlice";
import { addNotification } from "../../../redux/slices/notificationSlice";
import { useToast } from "../../providers";
import {
  ClipboardList,
  Filter,
  Eye,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function AdminRecordsPage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { leaves } = useSelector((state) => state.leaves);
  const { employees } = useSelector((state) => state.employees);
  const { policies } = useSelector((state) => state.policies);

  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDateFilter, setStartDateFilter] = useState("");

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectingLeave, setRejectingLeave] = useState(null);

  const departments = ["Development", "HR", "Finance", "Marketing", "Operations", "Management"];

  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        l.id.toLowerCase().includes(q) ||
        l.employeeName.toLowerCase().includes(q) ||
        l.leaveType.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q);

      const matchesEmp = employeeFilter === "All" || l.employeeId === employeeFilter;
      const matchesDept = departmentFilter === "All" || l.department === departmentFilter;
      const matchesType = typeFilter === "All" || l.leaveType === typeFilter;
      const matchesStatus = statusFilter === "All" || l.status === statusFilter;
      const matchesDate = !startDateFilter || l.startDate >= startDateFilter;

      return matchesSearch && matchesEmp && matchesDept && matchesType && matchesStatus && matchesDate;
    });
  }, [leaves, searchTerm, employeeFilter, departmentFilter, typeFilter, statusFilter, startDateFilter]);

  const handleApprove = (leave) => {
    dispatch(approveLeave({ id: leave.id, managerRemark: "Approved by Administrator." }));
    dispatch(
      deductBalance({
        employeeId: leave.employeeId,
        leaveType: leave.leaveType,
        days: leave.days,
      })
    );
    dispatch(
      addNotification({
        userId: leave.employeeId,
        title: "Leave Approved",
        message: `Your ${leave.leaveType} request for ${leave.days} days has been approved by Administrator.`,
        type: "success",
        link: "/employee/history",
      })
    );
    addToast(`Approved leave request ${leave.id} for ${leave.employeeName}.`, "success");
    setSelectedLeave(null);
  };

  const handleConfirmReject = (leaveId, remark) => {
    const targetLeave = leaves.find((l) => l.id === leaveId);
    if (!targetLeave) return;

    dispatch(rejectLeave({ id: leaveId, managerRemark: remark || "Declined by Administrator." }));
    dispatch(
      addNotification({
        userId: targetLeave.employeeId,
        title: "Leave Request Rejected",
        message: `Your ${targetLeave.leaveType} request was declined by Administrator. Remark: ${remark || "No reason given."}`,
        type: "danger",
        link: "/employee/history",
      })
    );
    addToast(`Declined leave request ${leaveId}. Requester notified.`, "info");
    setRejectingLeave(null);
    setSelectedLeave(null);
  };

  const handleExportCSV = () => {
    const headers = "Request ID,Employee,Department,Leave Type,Start Date,End Date,Days,Reason,Status,Applied Date,Manager Remark\n";
    const rows = filteredLeaves
      .map(
        (l) =>
          `"${l.id}","${l.employeeName}","${l.department}","${l.leaveType}","${l.startDate}","${l.endDate}",${l.days},"${l.reason.replace(/"/g, '""')}","${l.status}","${l.appliedDate}","${(l.managerRemark || "").replace(/"/g, '""')}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Organization_Leave_Records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exported all records to CSV.", "success");
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
            <ClipboardList size={24} color="var(--primary)" /> Enterprise Leave Records
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Central repository of all historical and active employee leave transactions.
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
          Export Master CSV
        </Button>
      </div>

      {/* Advanced Filters Bar */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: "20px" }}>
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="filters-group" style={{ flex: 1 }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search across all records..."
            />

            <select
              className="form-control"
              style={{ width: "auto", minWidth: "140px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              className="form-control"
              style={{ width: "auto", minWidth: "150px" }}
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
              style={{ width: "auto", minWidth: "160px" }}
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
              style={{ width: "auto", minWidth: "150px" }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              {policies.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>From:</span>
              <input
                type="date"
                className="form-control"
                style={{ width: "auto", padding: "8px 10px", fontSize: "13px" }}
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
              />
            </div>
          </div>

          {(searchTerm || statusFilter !== "All" || departmentFilter !== "All" || employeeFilter !== "All" || typeFilter !== "All" || startDateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setDepartmentFilter("All");
                setEmployeeFilter("All");
                setTypeFilter("All");
                setStartDateFilter("");
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {filteredLeaves.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No records found"
            description="No leave transactions matched your search criteria."
          />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((l) => (
                <tr key={l.id}>
                  <td>
                    <button
                      type="button"
                      onClick={() => setSelectedLeave(l)}
                      style={{ fontWeight: "700", color: "var(--primary)", fontSize: "13px" }}
                    >
                      {l.id}
                    </button>
                  </td>
                  <td>
                    <div style={{ fontWeight: "700", fontSize: "13px" }}>{l.employeeName}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{l.employeeId}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", background: "var(--background)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--border)" }}>
                      {l.department}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: "13px" }}>{l.leaveType}</strong>
                  </td>
                  <td style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                    {l.startDate} <span style={{ color: "var(--text-muted)" }}>to</span> {l.endDate}
                  </td>
                  <td style={{ fontWeight: "700" }}>{l.days}d</td>
                  <td>
                    <StatusBadge status={l.status} />
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{l.appliedDate}</td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      {l.status === "Pending" && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            icon={CheckCircle2}
                            onClick={() => handleApprove(l)}
                            title="Approve request"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={XCircle}
                            onClick={() => setRejectingLeave(l)}
                            title="Reject request"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedLeave(l)}
                      >
                        Inspect
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details & Approval Modal */}
      <LeaveDetailsModal
        leave={selectedLeave}
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        canManage={true}
        onApprove={handleApprove}
        onReject={(leave) => {
          setSelectedLeave(null);
          setRejectingLeave(leave);
        }}
      />

      {/* Reject Modal with Remarks */}
      <LeaveRejectModal
        leave={rejectingLeave}
        isOpen={!!rejectingLeave}
        onClose={() => setRejectingLeave(null)}
        onConfirmReject={handleConfirmReject}
      />
    </DashboardLayout>
  );
}
