"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { cancelLeave } from "../../../redux/slices/leaveSlice";
import { addNotification } from "../../../redux/slices/notificationSlice";
import { useToast } from "../../providers";
import StatusBadge from "../../../components/common/StatusBadge";
import Button from "../../../components/common/Button";
import SearchBar from "../../../components/common/SearchBar";
import EmptyState from "../../../components/common/EmptyState";
import LeaveDetailsModal from "../../../components/leave/LeaveDetailsModal";
import LeaveEditModal from "../../../components/leave/LeaveEditModal";
import LeaveCancelModal from "../../../components/leave/LeaveCancelModal";
import {
  History,
  FilePlus2,
  Filter,
  Eye,
  Edit3,
  XCircle,
  Download,
  Calendar,
} from "lucide-react";

export default function EmployeeHistoryPage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { leaves } = useSelector((state) => state.leaves);
  const { policies } = useSelector((state) => state.policies);

  const employeeId = user?.id || "EMP001";
  const myLeaves = leaves.filter((l) => l.employeeId === employeeId);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [startDateFilter, setStartDateFilter] = useState("");

  // Modals state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [editingLeave, setEditingLeave] = useState(null);
  const [cancellingLeave, setCancellingLeave] = useState(null);

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    return myLeaves.filter((l) => {
      // Search match
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        l.id.toLowerCase().includes(q) ||
        l.leaveType.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q);

      // Status match
      const matchesStatus = statusFilter === "All" || l.status === statusFilter;

      // Type match
      const matchesType = typeFilter === "All" || l.leaveType === typeFilter;

      // Start date filter
      const matchesDate = !startDateFilter || l.startDate >= startDateFilter;

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [myLeaves, searchTerm, statusFilter, typeFilter, startDateFilter]);

  const handleConfirmCancel = (leaveId) => {
    dispatch(cancelLeave(leaveId));
    dispatch(
      addNotification({
        userId: employeeId,
        title: "Leave Request Cancelled",
        message: `Your leave request (${leaveId}) has been marked as Cancelled.`,
        type: "info",
        link: "/employee/history",
      })
    );
    addToast("Leave request cancelled successfully.", "info");
  };

  const handleExportCSV = () => {
    const headers = "Request ID,Leave Type,Start Date,End Date,Days,Reason,Applied Date,Status,Manager Remark\n";
    const rows = filteredLeaves
      .map(
        (l) =>
          `"${l.id}","${l.leaveType}","${l.startDate}","${l.endDate}",${l.days},"${l.reason.replace(/"/g, '""')}","${l.appliedDate}","${l.status}","${(l.managerRemark || "").replace(/"/g, '""')}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `My_Leave_History_${employeeId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exported leave history to CSV file.", "success");
  };

  return (
    <DashboardLayout requiredRole="Employee">
      {/* Top Header */}
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
            <History size={24} color="var(--primary)" /> Leave History & Requests
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Track application statuses, view approval remarks, modify pending requests, or export reports.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Link href="/employee/apply-leave">
            <Button variant="primary" size="sm" icon={FilePlus2}>
              Apply New Leave
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: "20px" }}>
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="filters-group" style={{ flex: 1 }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by ID, leave type, or reason..."
            />

            {/* Status Filter */}
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

            {/* Leave Type Filter */}
            <select
              className="form-control"
              style={{ width: "auto", minWidth: "160px" }}
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

            {/* Date filter */}
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

          {(searchTerm || statusFilter !== "All" || typeFilter !== "All" || startDateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setTypeFilter("All");
                setStartDateFilter("");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Leave Requests Data Table */}
      {filteredLeaves.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No leave records found"
            description="We couldn't find any leave requests matching your current filter criteria."
            actionText="Submit New Leave"
            onAction={() => (window.location.href = "/employee/apply-leave")}
          />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Applied On</th>
                <th>Status</th>
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
                        style={{ fontWeight: "700", color: "var(--primary)", fontSize: "13px", textAlign: "left" }}
                      >
                        {leave.id}
                      </button>
                    </td>
                    <td>
                      <strong style={{ fontSize: "13px" }}>{leave.leaveType}</strong>
                    </td>
                    <td style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                      <div>{leave.startDate}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>to {leave.endDate}</div>
                    </td>
                    <td style={{ fontWeight: "700", color: "var(--text-main)" }}>
                      {leave.days} {leave.days === 1 ? "day" : "days"}
                    </td>
                    <td style={{ maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {leave.appliedDate}
                    </td>
                    <td>
                      <StatusBadge status={leave.status} />
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedLeave(leave)}
                          title="View complete details"
                        >
                          Details
                        </Button>

                        {isPending && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Edit3}
                              onClick={() => setEditingLeave(leave)}
                              title="Modify pending request"
                              style={{ color: "var(--primary)" }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={XCircle}
                              onClick={() => setCancellingLeave(leave)}
                              title="Cancel this request"
                              style={{ color: "var(--danger)" }}
                            >
                              Cancel
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
        onEdit={(l) => setEditingLeave(l)}
        onCancel={(l) => setCancellingLeave(l)}
      />

      <LeaveEditModal
        leave={editingLeave}
        isOpen={!!editingLeave}
        onClose={() => setEditingLeave(null)}
      />

      <LeaveCancelModal
        leave={cancellingLeave}
        isOpen={!!cancellingLeave}
        onClose={() => setCancellingLeave(null)}
        onConfirmCancel={handleConfirmCancel}
      />
    </DashboardLayout>
  );
}
