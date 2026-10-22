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
  ShieldCheck,
} from "lucide-react";

export default function ManagerApplyLeavePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const { user } = useSelector((state) => state.auth);
  const { policies } = useSelector((state) => state.policies);
  const { balances } = useSelector((state) => state.employees);

  const managerId = user?.id || "MGR001";
  const myBalances = balances.filter((b) => b.employeeId === managerId);

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

  // Selected leave type balance: check user balances or fallback to policy default entitlement
  const currentPolicy = activePolicies.find((p) => p.name === leaveType);
  const currentBalanceRecord = myBalances.find((b) => b.leaveType === leaveType);
  const availableBalance = currentBalanceRecord
    ? currentBalanceRecord.remaining
    : (currentPolicy ? currentPolicy.entitlement : 12);

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
      errs.days = `Requested duration (${calculatedDays} days) exceeds available quota (${availableBalance} days).`;
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

    // Leave request with managerId routed to Administrator
    const payload = {
      employeeId: user?.id || "MGR001",
      employeeName: user?.name || "Robert Fox",
      department: user?.department || "Management",
      managerId: "ADM001",
      managerName: "Admin User",
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

    // 1. Create notification for manager
    dispatch(
      addNotification({
        userId: user?.id || "MGR001",
        title: "Leave Request Submitted",
        message: `Your ${leaveType} request for ${calculatedDays} days (${startDate} to ${endDate}) is submitted and awaiting Administrator approval.`,
        type: "info",
        link: "/manager/history",
      })
    );

    // 2. Create notification for Administrator (ADM001)
    dispatch(
      addNotification({
        userId: "ADM001",
        title: "Manager Leave Request Pending",
        message: `${user?.name || "Manager"} submitted a ${leaveType} request for ${calculatedDays} days awaiting your approval.`,
        type: "warning",
        link: "/admin/records",
      })
    );

    setTimeout(() => {
      setSubmitting(false);
      addToast(
        "Manager leave request submitted successfully! Awaiting Administrator approval.",
        "success",
        5000
      );
      router.push("/manager/history");
    }, 400);
  };

  return (
    <DashboardLayout requiredRole="Manager">
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Breadcrumb back */}
        <div style={{ marginBottom: "18px" }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "var(--text-secondary)",
              fontWeight: "500",
            }}
          >
            <ArrowLeft size={16} /> Back to previous page
          </button>
        </div>

        {/* Admin Approval Notice Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
            border: "1px solid rgba(37, 99, 235, 0.2)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              background: "var(--primary)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>
              Manager Leave Requests Require Administrator Approval
            </h4>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: "3px 0 0" }}>
              As a Manager, your leave applications are routed directly to the Chief Administrator (Admin User) for official review and approval.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
            <div>
              <h2 className="card-title" style={{ fontSize: "20px" }}>
                <FilePlus2 size={22} color="var(--primary)" /> Apply for Manager Leave
              </h2>
              <p className="card-subtitle">
                Submit your time-off request to the Administrator with dates, reason, and documentation.
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
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", fontWeight: "600" }}>
                    Available Quota
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary)" }}>
                    {availableBalance}{" "}
                    <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)" }}>
                      Days
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Policy Max Consecutive</div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>
                    {currentPolicy?.maxDays ? `${currentPolicy.maxDays} Days` : "Uncapped"}
                  </div>
                </div>
              </div>
            </div>

            {/* Date Pickers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
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

              <div className="form-group" style={{ marginBottom: 0 }}>
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

            {/* Calculated Days Preview Pill */}
            {calculatedDays > 0 && (
              <div
                style={{
                  background: "var(--primary-light)",
                  border: "1px solid rgba(37, 99, 235, 0.2)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--primary)", fontSize: "13px", fontWeight: "600" }}>
                  <Sparkles size={16} /> Total Duration:
                </div>
                <div style={{ fontWeight: "800", color: "var(--primary)", fontSize: "15px" }}>
                  {calculatedDays} {calculatedDays === 1 ? "Working Day" : "Working Days"}
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="form-group">
              <label className="form-label">
                Reason for Leave <span className="required">*</span>
              </label>
              <textarea
                className={`form-control ${errors.reason ? "error" : ""}`}
                rows={4}
                placeholder="State the purpose of your leave for Administrator review..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                {errors.reason ? (
                  <span className="form-error-msg">{errors.reason}</span>
                ) : (
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Minimum 5 characters required.
                  </span>
                )}
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {reason.length} characters
                </span>
              </div>
            </div>

            {/* Document Upload */}
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
                onClick={() => document.getElementById("mgrDocUpload").click()}
              >
                <Upload size={24} color="var(--primary)" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>
                  {documentFile ? documentFile.name : "Click to attach document"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  PDF, DOCX, PNG or JPG up to 5MB
                </div>
                <input
                  id="mgrDocUpload"
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", fontSize: "12px" }}>
                  <span style={{ color: "var(--primary)", fontWeight: "500" }}>✓ File attached: {documentFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setDocumentFile(null)}
                    style={{ color: "var(--danger)", cursor: "pointer", background: "none", border: "none" }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "18px" }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/manager/dashboard")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={FilePlus2}
                disabled={submitting}
              >
                {submitting ? "Submitting to Admin..." : "Submit to Administrator"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
