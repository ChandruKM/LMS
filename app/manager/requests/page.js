"use client";

import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { approveLeave, rejectLeave } from "../../../redux/slices/leaveSlice";
import { deductBalance } from "../../../redux/slices/employeeSlice";
import { addNotification } from "../../../redux/slices/notificationSlice";
import { useToast } from "../../providers";
import StatusBadge from "../../../components/common/StatusBadge";
import Button from "../../../components/common/Button";
import SearchBar from "../../../components/common/SearchBar";
import EmptyState from "../../../components/common/EmptyState";
import LeaveDetailsModal from "../../../components/leave/LeaveDetailsModal";
import LeaveRejectModal from "../../../components/leave/LeaveRejectModal";
import {
  CheckSquare,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
} from "lucide-react";

export default function ManagerRequestsPage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { leaves } = useSelector((state) => state.leaves);
  const { employees } = useSelector((state) => state.employees);
  const { policies } = useSelector((state) => state.policies);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending"); // Default to Pending for manager convenience
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectingLeave, setRejectingLeave] = useState(null);

  // Filter team requests
  const teamMemberIds = employees.filter((e) => e.role === "Employee").map((e) => e.id);
  const teamLeaves = leaves.filter((l) => teamMemberIds.includes(l.employeeId));

  const filteredLeaves = useMemo(() => {
    return teamLeaves.filter((l) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        l.employeeName.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.leaveType.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "All" || l.status === statusFilter;
      const matchesEmp = employeeFilter === "All" || l.employeeId === employeeFilter;
      const matchesType = typeFilter === "All" || l.leaveType === typeFilter;

      return matchesSearch && matchesStatus && matchesEmp && matchesType;
    });
  }, [teamLeaves, searchTerm, statusFilter, employeeFilter, typeFilter]);

  const handleApprove = (leave) => {
    dispatch(approveLeave({ id: leave.id, managerRemark: "Approved by manager." }));

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

    addToast(`Rejected request ${leaveId}. Employee notified.`, "info");
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
    link.setAttribute("download", `Team_Leave_Requests.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exported team requests to CSV.", "success");
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
            <CheckSquare size={24} color="var(--primary)" /> Team Leave Requests
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Review, approve, or reject employee leave requests and attach custom manager remarks.
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
          Export Table CSV
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: "20px" }}>
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="filters-group" style={{ flex: 1 }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by employee, ID, reason..."
            />

            <select
              className="form-control"
              style={{ width: "auto", minWidth: "140px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Only</option>
              <option value="Approved">Approved Only</option>
              <option value="Rejected">Rejected Only</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              className="form-control"
              style={{ width: "auto", minWidth: "160px" }}
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
            >
              <option value="All">All Team Members</option>
              {employees.filter((e) => e.role === "Employee").map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.department})
                </option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ width: "auto", minWidth: "150px" }}
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

          {(searchTerm || statusFilter !== "All" || employeeFilter !== "All" || typeFilter !== "All") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setEmployeeFilter("All");
                setTypeFilter("All");
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
            title="No leave requests found"
            description="There are no employee leave applications matching your current filter filters."
          />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((leave) => {
                const isPending = leave.status === "Pending";

                return (
                  <tr key={leave.id}>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedLeave(leave)}
                        style={{ fontWeight: "700", color: "var(--primary)", fontSize: "13px" }}
                      >
                        {leave.id}
                      </button>
                    </td>
                    <td>
                      <div style={{ fontWeight: "700", fontSize: "13px" }}>{leave.employeeName}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {leave.employeeId} &bull; {leave.department}
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: "13px" }}>{leave.leaveType}</strong>
                    </td>
                    <td style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                      {leave.startDate} <span style={{ color: "var(--text-muted)" }}>to</span> {leave.endDate}
                    </td>
                    <td style={{ fontWeight: "700" }}>{leave.days}d</td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td>
                      <StatusBadge status={leave.status} />
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {leave.appliedDate}
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedLeave(leave)}
                          title="View Details"
                        >
                          View
                        </Button>

                        {isPending && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(leave)}
                              title="Approve this request"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setRejectingLeave(leave)}
                              title="Reject with remarks"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
