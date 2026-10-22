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
import LeaveCancelModal from "../../../components/leave/LeaveCancelModal";
import {
  History,
  FilePlus2,
  Filter,
  Eye,
  XCircle,
  Download,
  Calendar,
  ShieldCheck,
} from "lucide-react";

export default function ManagerHistoryPage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { leaves } = useSelector((state) => state.leaves);
  const { policies } = useSelector((state) => state.policies);

  const managerId = user?.id || "MGR001";
  const myLeaves = leaves.filter((l) => l.employeeId === managerId);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [startDateFilter, setStartDateFilter] = useState("");

  // Modals state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [cancellingLeave, setCancellingLeave] = useState(null);

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    return myLeaves.filter((l) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        l.id.toLowerCase().includes(q) ||
        l.leaveType.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "All" || l.status === statusFilter;
      const matchesType = typeFilter === "All" || l.leaveType === typeFilter;
      const matchesDate = !startDateFilter || l.startDate >= startDateFilter;

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [myLeaves, searchTerm, statusFilter, typeFilter, startDateFilter]);

  const handleConfirmCancel = (leaveId) => {
    dispatch(cancelLeave(leaveId));
    dispatch(
      addNotification({
        userId: managerId,
        title: "Leave Request Cancelled",
        message: `Your leave request (${leaveId}) has been cancelled.`,
        type: "info",
        link: "/manager/history",
      })
    );
    addToast("Leave request cancelled successfully.", "info");
  };

  const handleExportCSV = () => {
    const headers = "Request ID,Leave Type,Start Date,End Date,Days,Reason,Applied Date,Status,Admin Remark\n";
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
    link.setAttribute("download", `Manager_Leave_History_${managerId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exported your leave history to CSV.", "success");
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
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "800",
              color: "var(--text-main)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <History size={24} color="var(--primary)" /> My Leave History
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Track and monitor the status of your personal leave applications submitted to Administrator.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {filteredLeaves.length > 0 && (
            <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
              Export CSV
            </Button>
          )}
          <Link href="/manager/apply-leave">
            <Button variant="primary" size="sm" icon={FilePlus2}>
              Apply New Leave
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by ID, type or reason..."
            maxWidth="320px"
          />

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <select
              className="form-control"
              style={{ width: "auto", minWidth: "130px" }}
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

            <input
              type="date"
              className="form-control"
              style={{ width: "auto" }}
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              title="Filter by start date"
            />

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
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* History Table */}
      {filteredLeaves.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No leave records found"
            description={
              searchTerm || statusFilter !== "All" || typeFilter !== "All" || startDateFilter
                ? "No leaves match your applied filter criteria."
                : "You have not submitted any leave applications yet."
            }
            actionLabel="Apply for Leave"
            onAction={() => window.location.assign("/manager/apply-leave")}
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
                <th>Duration</th>
                <th>Status</th>
                <th>Approver</th>
                <th>Admin Remark</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((l) => (
                <tr key={l.id}>
                  <td>
                    <button
                      type="button"
                      onClick={() => setSelectedLeave(l)}
                      style={{
                        fontWeight: "700",
                        color: "var(--primary)",
                        fontSize: "13px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {l.id}
                    </button>
                  </td>
                  <td>
                    <strong>{l.leaveType}</strong>
                  </td>
                  <td style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                    {l.startDate} <span style={{ color: "var(--text-muted)" }}>to</span> {l.endDate}
                  </td>
                  <td>
                    <span style={{ fontWeight: "700" }}>{l.days}</span> {l.days === 1 ? "day" : "days"}
                  </td>
                  <td>
                    <StatusBadge status={l.status} />
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>
                      Admin User (ADM001)
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: l.managerRemark ? "var(--text-main)" : "var(--text-muted)" }}>
                      {l.managerRemark || "—"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedLeave(l)}
                      >
                        Details
                      </Button>
                      {l.status === "Pending" && (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={XCircle}
                          onClick={() => setCancellingLeave(l)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      <LeaveDetailsModal
        leave={selectedLeave}
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        onCancel={(leave) => setCancellingLeave(leave)}
      />

      {/* Cancel Modal */}
      <LeaveCancelModal
        leave={cancellingLeave}
        isOpen={!!cancellingLeave}
        onClose={() => setCancellingLeave(null)}
        onConfirm={handleConfirmCancel}
      />
    </DashboardLayout>
  );
}
