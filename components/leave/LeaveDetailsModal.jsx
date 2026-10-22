"use client";

import Modal from "../common/Modal";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import { Calendar, User, FileText, Clock, AlertCircle, Edit3, XCircle } from "lucide-react";

export default function LeaveDetailsModal({
  leave,
  isOpen,
  onClose,
  onEdit,
  onCancel,
  canManage = false, // True if manager or admin reviewing
  onApprove,
  onReject,
}) {
  if (!leave) return null;

  const isPending = leave.status === "Pending";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Leave Details — ${leave.id}`}
      maxWidth="600px"
      footer={
        <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "space-between" }}>
          <div>
            {isPending && onCancel && (
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                onClick={() => {
                  onClose();
                  onCancel(leave);
                }}
              >
                Cancel Leave
              </Button>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {canManage && isPending && (
              <>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onReject(leave);
                  }}
                >
                  Reject
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onApprove(leave);
                  }}
                >
                  Approve Request
                </Button>
              </>
            )}
            {isPending && onEdit && !canManage && (
              <Button
                variant="primary"
                size="sm"
                icon={Edit3}
                onClick={() => {
                  onClose();
                  onEdit(leave);
                }}
              >
                Edit Request
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Top Header Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            borderRadius: "var(--radius-md)",
            background: "var(--background)",
            border: "1px solid var(--border)",
          }}
        >
          <div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
              {leave.leaveType}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Applied on {leave.appliedDate}
            </div>
          </div>
          <StatusBadge status={leave.status} />
        </div>

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Employee</span>
            <div style={{ fontWeight: "600", fontSize: "14px", marginTop: "2px" }}>
              {leave.employeeName} ({leave.employeeId})
            </div>
          </div>

          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Department</span>
            <div style={{ fontWeight: "600", fontSize: "14px", marginTop: "2px" }}>
              {leave.department || "General"}
            </div>
          </div>

          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Duration</span>
            <div style={{ fontWeight: "600", fontSize: "14px", marginTop: "2px", color: "var(--primary)" }}>
              {leave.days} {leave.days === 1 ? "Day" : "Days"}
            </div>
          </div>

          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Date Range</span>
            <div style={{ fontWeight: "600", fontSize: "14px", marginTop: "2px" }}>
              {leave.startDate} to {leave.endDate}
            </div>
          </div>
        </div>

        {/* Reason */}
        <div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Reason for Leave</span>
          <div
            style={{
              padding: "12px",
              background: "var(--background)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              fontSize: "13px",
              marginTop: "4px",
              color: "var(--text-main)",
            }}
          >
            {leave.reason || "No reason specified."}
          </div>
        </div>

        {/* Supporting Document */}
        {leave.documentName && (
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Attached Document</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                background: "var(--primary-light)",
                color: "var(--primary)",
                borderRadius: "var(--radius-md)",
                fontSize: "13px",
                fontWeight: "500",
                marginTop: "4px",
                width: "fit-content",
              }}
            >
              <FileText size={16} />
              <span>{leave.documentName}</span>
            </div>
          </div>
        )}

        {/* Manager Remarks */}
        {leave.managerRemark && (
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Manager Remarks</span>
            <div
              style={{
                padding: "12px",
                background: leave.status === "Approved" ? "var(--success-bg)" : "var(--danger-bg)",
                borderColor: leave.status === "Approved" ? "var(--success-border)" : "var(--danger-border)",
                borderWidth: "1px",
                borderStyle: "solid",
                borderRadius: "var(--radius-md)",
                fontSize: "13px",
                marginTop: "4px",
                color: leave.status === "Approved" ? "#166534" : "#991B1B",
              }}
            >
              {leave.managerRemark}
            </div>
          </div>
        )}

        {/* Note if not editable */}
        {!isPending && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
            <AlertCircle size={14} />
            This request has been finalized ({leave.status.toLowerCase()}) and can no longer be edited.
          </div>
        )}
      </div>
    </Modal>
  );
}
