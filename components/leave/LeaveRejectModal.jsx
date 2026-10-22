"use client";

import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";

export default function LeaveRejectModal({ leave, isOpen, onClose, onConfirmReject }) {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  if (!leave) return null;

  const handleReject = () => {
    if (!remarks.trim()) {
      setError("Please provide a reason or remarks for rejecting this request.");
      return;
    }
    onConfirmReject(leave.id, remarks.trim());
    setRemarks("");
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Leave Request"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleReject}>
            Reject Request
          </Button>
        </>
      }
    >
      <div>
        <p style={{ fontSize: "14px", color: "var(--text-main)", marginBottom: "14px" }}>
          You are rejecting <strong>{leave.employeeName}</strong>’s request for{" "}
          <strong>{leave.leaveType}</strong> ({leave.days} {leave.days === 1 ? "day" : "days"}, from {leave.startDate} to {leave.endDate}).
        </p>

        {error && (
          <div
            style={{
              padding: "10px",
              background: "var(--danger-bg)",
              color: "var(--danger)",
              borderRadius: "var(--radius-md)",
              marginBottom: "12px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            Rejection Reason / Manager Remarks <span className="required">*</span>
          </label>
          <textarea
            className="form-control"
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Explain why this request is being rejected (e.g. key deliverable deadline, team capacity shortage)..."
            autoFocus
          />
        </div>
      </div>
    </Modal>
  );
}
