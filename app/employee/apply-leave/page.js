"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { addLeave } from "../../../redux/slices/leaveSlice";
import { addNotification } from "../../../redux/slices/notificationSlice";
import apiClient from "../../../lib/apiClient";
import { useToast } from "../../providers";
import Button from "../../../components/common/Button";
import {
  FilePlus2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Upload,
  Info,
  ArrowLeft,
  Clock,
  Sparkles,
} from "lucide-react";

export default function ApplyLeavePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const { user } = useSelector((state) => state.auth);
  const { policies } = useSelector((state) => state.policies);
  const { balances } = useSelector((state) => state.employees);

  const employeeId = user?.id || "EMP001";
  const myBalances = balances.filter((b) => b.employeeId === employeeId);

  // Enabled policies
  const activePolicies = policies.filter((p) => p.enabled);

  // Form states
  const [leaveType, setLeaveType] = useState(activePolicies[0]?.name || "Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Selected leave type balance
  const currentBalanceRecord = myBalances.find((b) => b.leaveType === leaveType);
  const availableBalance = currentBalanceRecord ? currentBalanceRecord.remaining : 0;
  const currentPolicy = activePolicies.find((p) => p.name === leaveType);

  // Current real-time local date string (YYYY-MM-DD)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  // Calculate days automatically
  const calculatedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    if (startDate < todayStr) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end - start;
    if (diff < 0) return 0;

    // Days difference inclusive
    const count = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return count;
  }, [startDate, endDate, todayStr]);

  const validate = () => {
    const errs = {};
    if (!leaveType) errs.leaveType = "Please select a leave type.";
    
    if (!startDate) {
      errs.startDate = "Start date is mandatory.";
    } else if (startDate < todayStr) {
      errs.startDate = "You cannot apply for past dates. Please select today or a future date.";
    }

    if (!endDate) {
      errs.endDate = "End date is mandatory.";
    } else if (endDate < todayStr) {
      errs.endDate = "End date cannot be in the past.";
    } else if (startDate && new Date(endDate) < new Date(startDate)) {
      errs.endDate = "End date cannot be earlier than start date.";
    }

    if (!reason.trim()) {
      errs.reason = "Please enter a valid reason for taking this leave.";
    } else if (reason.trim().length < 5) {
      errs.reason = "Reason should be at least 5 characters.";
    }

    if (calculatedDays > availableBalance) {
      errs.days = `Requested duration (${calculatedDays} days) exceeds your available balance (${availableBalance} days).`;
    }

    if (currentPolicy?.maxDays && calculatedDays > currentPolicy.maxDays) {
      errs.days = `This policy allows a maximum of ${currentPolicy.maxDays} consecutive days per request.`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast("Please rectify form errors before submitting.", "error");
      return;
    }

    setSubmitting(true);

    const docName = documentFile ? documentFile.name : "";

    // 1. Create leave request
    const payload = {
      employeeId: user?.id || "EMP001",
      employeeName: user?.name || "John Doe",
      department: user?.department || "Development",
      managerId: user?.managerId || "MGR001",
      managerName: user?.manager || "Robert Fox",
      leaveType,
      startDate,
      endDate,
      days: calculatedDays,
      reason: reason.trim(),
      documentName: docName,
    };

    dispatch(addLeave(payload));
    try {
      await apiClient.leaves.apply(payload);
    } catch (apiErr) {
      console.warn("[MySQL Sync] Direct apply failed, middleware will retry:", apiErr.message);
    }

    // 2. Create notification for employee
    dispatch(
      addNotification({
        userId: user?.id || "EMP001",
        title: "Leave Request Submitted",
        message: `Your ${leaveType} request for ${calculatedDays} days (${startDate} to ${endDate}) is submitted and awaiting manager review.`,
        type: "info",
        link: "/employee/history",
      })
    );

    // 3. Create notification for manager
    dispatch(
      addNotification({
        userId: user?.managerId || "MGR001",
        title: "New Leave Application",
        message: `${user?.name || "An employee"} submitted a ${leaveType} request for ${calculatedDays} days.`,
        type: "warning",
        link: "/manager/requests",
      })
    );

    setTimeout(() => {
      setSubmitting(false);
      addToast(
        "Leave request submitted successfully. Your request is waiting for manager approval.",
        "success",
        5000
      );
      router.push("/employee/history");
    }, 400);
  };

  return (
    <DashboardLayout requiredRole="Employee">
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Breadcrumb back */}
        <div style={{ marginBottom: "18px" }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}
          >
            <ArrowLeft size={16} /> Back to previous page
          </button>
        </div>

        <div className="card">
          <div className="card-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
            <div>
              <h2 className="card-title" style={{ fontSize: "20px" }}>
                <FilePlus2 size={22} color="var(--primary)" /> Apply for Leave
              </h2>
              <p className="card-subtitle">
                Fill in the details below to request planned time-off or emergency absence.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
            {/* Global Errors Banner */}
            {errors.days && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--danger-bg)",
                  color: "var(--danger)",
                  border: "1px solid var(--danger-border)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "20px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errors.days}</span>
              </div>
            )}

            {/* Leave Type & Balance Display */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "18px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Leave Type <span className="required">*</span>
                </label>
                <select
                  className={`form-control ${errors.leaveType ? "error" : ""}`}
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  {activePolicies.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.leaveType && <span className="form-error-msg">{errors.leaveType}</span>}
              </div>

              {/* Dynamic Live Balance Meter */}
              <div
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Available {leaveType} Quota
                  </span>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: availableBalance > 0 ? "var(--primary)" : "var(--danger)" }}>
                    {availableBalance} Days
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: "11px", color: "var(--text-muted)" }}>
                  Entitlement: {currentBalanceRecord?.entitlement || 0}d<br />
                  Used: {currentBalanceRecord?.used || 0}d
                </div>
              </div>
            </div>

            {/* Dates: Start & End */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">
                  Start Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${errors.startDate ? "error" : ""}`}
                  value={startDate}
                  min={todayStr}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                {errors.startDate && <span className="form-error-msg">{errors.startDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  End Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${errors.endDate ? "error" : ""}`}
                  value={endDate}
                  min={startDate || todayStr}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                {errors.endDate && <span className="form-error-msg">{errors.endDate}</span>}
              </div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "-8px", marginBottom: "14px" }}>
              <Info size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
              Leave dates must be in the present or future (dates prior to {todayStr} are disabled).
            </div>


            {/* Calculated Days Preview Box */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: calculatedDays > availableBalance ? "var(--danger-bg)" : "var(--primary-light)",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${calculatedDays > availableBalance ? "var(--danger-border)" : "var(--primary-border)"}`,
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Clock size={18} color={calculatedDays > availableBalance ? "var(--danger)" : "var(--primary)"} />
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>
                  Total Requested Duration:
                </span>
              </div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: calculatedDays > availableBalance ? "var(--danger)" : "var(--primary)" }}>
                {calculatedDays} {calculatedDays === 1 ? "Working Day" : "Working Days"}
              </div>
            </div>

            {/* Reason */}
            <div className="form-group">
              <label className="form-label">
                Reason for Leave <span className="required">*</span>
              </label>
              <textarea
                className={`form-control ${errors.reason ? "error" : ""}`}
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a clear description for your leave request (e.g. personal commitments, illness, vacation)..."
              />
              {errors.reason && <span className="form-error-msg">{errors.reason}</span>}
            </div>

            {/* Supporting Document */}
            <div className="form-group">
              <label className="form-label">Supporting Document (Optional)</label>
              <div
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px",
                  textAlign: "center",
                  background: "var(--background)",
                  cursor: "pointer",
                }}
                onClick={() => document.getElementById("file-upload-input").click()}
              >
                <Upload size={24} color="var(--text-muted)" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>
                  {documentFile ? documentFile.name : "Click to attach file (medical slip, invitation, proof)"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  PDF, DOC, PNG, JPG up to 10MB
                </div>
                <input
                  id="file-upload-input"
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setDocumentFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
              {documentFile && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", fontSize: "12px", color: "var(--success)" }}>
                  <span>&bull; {documentFile.name} ready to attach</span>
                  <button
                    type="button"
                    onClick={() => setDocumentFile(null)}
                    style={{ color: "var(--danger)", textDecoration: "underline", fontSize: "11px" }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Policy Notes / Hint */}
            {currentPolicy?.description && (
              <div
                style={{
                  padding: "12px",
                  background: "#F8FAFC",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  marginBottom: "24px",
                }}
              >
                <Info size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong>{currentPolicy.name} Guidelines:</strong> {currentPolicy.description}
                  {currentPolicy.carryForward && " Carry-forward is permitted at year-end."}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "18px" }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/employee/dashboard")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                icon={CheckCircle2}
              >
                Submit Leave Application
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
