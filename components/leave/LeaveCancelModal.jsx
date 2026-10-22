"use client";

import Modal from "../common/Modal";
import Button from "../common/Button";
import { AlertTriangle } from "lucide-react";

export default function LeaveCancelModal({ leave, isOpen, onClose, onConfirmCancel }) {
  if (!leave) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Leave Request"
      maxWidth="480px"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Keep Request
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onConfirmCancel(leave.id);
              onClose();
            }}
          >
            Confirm Cancellation
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "var(--radius-full)",
            background: "var(--warning-bg)",
            color: "var(--warning)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={22} />
        </div>
        <div>
          <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "6px" }}>
            Are you sure you want to cancel this leave request?
          </h4>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
            You are cancelling your <strong>{leave.leaveType}</strong> request ({leave.startDate} to {leave.endDate}).
            This request will be marked as <strong>Cancelled</strong> and will remain visible in your Leave History.
          </p>
        </div>
      </div>
    </Modal>
  );
}
