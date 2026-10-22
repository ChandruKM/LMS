"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { editLeave } from "../../redux/slices/leaveSlice";
import { useToast } from "../../app/providers";
import Modal from "../common/Modal";
import Button from "../common/Button";

export default function LeaveEditModal({ leave, isOpen, onClose }) {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { policies } = useSelector((state) => state.policies);

  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (leave) {
      setLeaveType(leave.leaveType || "");
      setStartDate(leave.startDate || "");
      setEndDate(leave.endDate || "");
      setReason(leave.reason || "");
      setDocumentName(leave.documentName || "");
      setError("");
    }
  }, [leave]);

  if (!leave) return null;

  // Calculate days
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e - s;
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  const calculatedDays = calculateDays(startDate, endDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!leaveType) {
      setError("Please select a leave type.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Both start and end dates are required.");
      return;
    }
    if (startDate < todayStr) {
      setError("You cannot apply for past dates. Please select today or a future date.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be earlier than start date.");
      return;
    }
    if (!reason.trim()) {
      setError("Please state a reason for the leave.");
      return;
    }


    dispatch(
      editLeave({
        id: leave.id,
        leaveType,
        startDate,
        endDate,
        days: calculatedDays,
        reason,
        documentName,
      })
    );

    addToast("Leave request updated successfully.", "success");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Modify Pending Request — ${leave.id}`}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "var(--danger-bg)",
              color: "var(--danger)",
              borderRadius: "var(--radius-md)",
              marginBottom: "16px",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            Leave Type <span className="required">*</span>
          </label>
          <select
            className="form-control"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
          >
            {policies.filter((p) => p.enabled).map((p) => (
              <option key={p.id} value={p.name}>
                {p.name} (Max {p.entitlement} days/yr)
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label">
              Start Date <span className="required">*</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              min={todayStr}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              End Date <span className="required">*</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              min={startDate || todayStr}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>


        <div style={{ marginBottom: "16px", fontSize: "13px", color: "var(--text-secondary)" }}>
          Calculated Duration:{" "}
          <strong style={{ color: "var(--primary)" }}>
            {calculatedDays} {calculatedDays === 1 ? "Day" : "Days"}
          </strong>
        </div>

        <div className="form-group">
          <label className="form-label">
            Reason for Leave <span className="required">*</span>
          </label>
          <textarea
            className="form-control"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you are taking this leave..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Supporting Document (Optional)</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setDocumentName(e.target.files[0].name);
              }
            }}
          />
          {documentName && (
            <span className="form-hint" style={{ marginTop: "4px" }}>
              Current file: {documentName}
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
}
