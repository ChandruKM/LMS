"use client";

import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { adjustBalance } from "../../../redux/slices/employeeSlice";
import { useToast } from "../../providers";
import Button from "../../../components/common/Button";
import SearchBar from "../../../components/common/SearchBar";
import Modal from "../../../components/common/Modal";
import EmptyState from "../../../components/common/EmptyState";
import {
  Wallet,
  PlusCircle,
  History,
  TrendingUp,
  User,
  CheckCircle2,
  Calendar,
  Download,
} from "lucide-react";

export default function AdminBalancesPage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { employees, balances, adjustments } = useSelector((state) => state.employees);
  const { policies } = useSelector((state) => state.policies);

  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Manual Adjustment Modal
  const [adjustingRecord, setAdjustingRecord] = useState(null);
  const [adjustmentValue, setAdjustmentValue] = useState(1);
  const [adjustmentReason, setAdjustmentReason] = useState("");

  // Map employee details to each balance record
  const enrichedBalances = useMemo(() => {
    return balances.map((b) => {
      const emp = employees.find((e) => e.id === b.employeeId);
      return {
        ...b,
        employeeName: emp ? emp.name : b.employeeId,
        department: emp ? emp.department : "General",
        avatar: emp ? emp.avatar : "",
      };
    });
  }, [balances, employees]);

  // Filtered balances
  const filteredBalances = useMemo(() => {
    return enrichedBalances.filter((b) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        b.employeeName.toLowerCase().includes(q) ||
        b.employeeId.toLowerCase().includes(q) ||
        b.leaveType.toLowerCase().includes(q);

      const matchesEmp = employeeFilter === "All" || b.employeeId === employeeFilter;
      const matchesType = typeFilter === "All" || b.leaveType === typeFilter;

      return matchesSearch && matchesEmp && matchesType;
    });
  }, [enrichedBalances, searchTerm, employeeFilter, typeFilter]);

  const handleOpenAdjust = (record) => {
    setAdjustingRecord(record);
    setAdjustmentValue(1);
    setAdjustmentReason("Performance recognition or comp-off");
  };

  const handleConfirmAdjust = (e) => {
    e.preventDefault();
    if (!adjustingRecord) return;

    dispatch(
      adjustBalance({
        employeeId: adjustingRecord.employeeId,
        leaveType: adjustingRecord.leaveType,
        adjustment: Number(adjustmentValue),
        reason: adjustmentReason.trim() || "Manual HR quota adjustment",
        adjustedBy: user?.name || "Admin User",
      })
    );

    const sign = Number(adjustmentValue) >= 0 ? `+${adjustmentValue}` : `${adjustmentValue}`;
    addToast(
      `Adjusted ${adjustingRecord.leaveType} for ${adjustingRecord.employeeName} by ${sign} days.`,
      "success"
    );
    setAdjustingRecord(null);
  };

  const handleExportCSV = () => {
    const headers = "Employee ID,Name,Department,Leave Type,Total Entitlement,Used,Remaining\n";
    const rows = filteredBalances
      .map((b) => `"${b.employeeId}","${b.employeeName}","${b.department}","${b.leaveType}",${b.entitlement},${b.used},${b.remaining}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Leave_Balances_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exported balances to CSV.", "success");
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
            <Wallet size={24} color="var(--primary)" /> Employee Leave Balances & Quota
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Audit employee entitlements, monitor usage rates, and perform manual balance adjustments with historical logs.
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
          Export Balances CSV
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: "20px" }}>
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="filters-group" style={{ flex: 1 }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by employee, ID, or leave type..."
            />

            <select
              className="form-control"
              style={{ width: "auto", minWidth: "160px" }}
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
            >
              <option value="All">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>

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
          </div>

          {(searchTerm || employeeFilter !== "All" || typeFilter !== "All") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setEmployeeFilter("All");
                setTypeFilter("All");
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Leave Balances Table */}
      {filteredBalances.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No leave balance records found"
            description="Try relaxing your filters."
          />
        </div>
      ) : (
        <div className="table-responsive" style={{ marginBottom: "32px" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>Total Entitlement</th>
                <th>Used Days</th>
                <th>Remaining Quota</th>
                <th>Utilization</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBalances.map((record, idx) => {
                const percent = record.entitlement > 0 ? Math.round((record.used / record.entitlement) * 100) : 0;

                return (
                  <tr key={`${record.employeeId}-${record.leaveType}-${idx}`}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={record.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"}
                          alt={record.employeeName}
                          style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        <div>
                          <strong>{record.employeeName}</strong>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {record.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{record.department}</td>
                    <td>
                      <strong style={{ fontSize: "13px" }}>{record.leaveType}</strong>
                    </td>
                    <td style={{ fontWeight: "600" }}>{record.entitlement} Days</td>
                    <td style={{ color: "#EF4444", fontWeight: "600" }}>{record.used} Days</td>
                    <td>
                      <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--primary)" }}>
                        {record.remaining} Days
                      </span>
                    </td>
                    <td style={{ minWidth: "120px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", background: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(100, percent)}%`, height: "100%", background: percent > 80 ? "#EF4444" : "var(--primary)", borderRadius: "9999px" }} />
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", width: "32px" }}>{percent}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={PlusCircle}
                          onClick={() => handleOpenAdjust(record)}
                        >
                          Manual Adjust
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 22: Adjustment History Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <History size={18} color="var(--primary)" /> Quota Adjustment History Log
            </h3>
            <p className="card-subtitle">
              Audit trail of all administrative balance adjustments and compensatory leaves granted.
            </p>
          </div>
        </div>

        {adjustments.length === 0 ? (
          <div style={{ padding: "28px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
            No quota adjustments have been performed yet.
          </div>
        ) : (
          <div className="table-responsive" style={{ border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Prev Balance</th>
                  <th>Adjustment</th>
                  <th>New Balance</th>
                  <th>Reason / Notes</th>
                  <th>Adjusted By</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map((adj) => (
                  <tr key={adj.id}>
                    <td>
                      <span style={{ fontWeight: "700", color: "var(--text-secondary)", fontSize: "12px" }}>
                        {adj.id}
                      </span>
                    </td>
                    <td>
                      <strong>{adj.employeeName}</strong>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{adj.employeeId}</div>
                    </td>
                    <td>{adj.leaveType}</td>
                    <td style={{ color: "var(--text-muted)" }}>{adj.previousBalance}d</td>
                    <td>
                      <strong style={{ color: adj.adjustment >= 0 ? "var(--success)" : "var(--danger)" }}>
                        {adj.adjustment >= 0 ? `+${adj.adjustment}` : adj.adjustment} Days
                      </strong>
                    </td>
                    <td>
                      <strong style={{ color: "var(--primary)" }}>{adj.newBalance} Days</strong>
                    </td>
                    <td style={{ maxWidth: "200px" }}>{adj.reason}</td>
                    <td style={{ fontSize: "12px" }}>{adj.adjustedBy}</td>
                    <td style={{ fontSize: "11px", color: "var(--text-muted)" }}>{adj.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Balance Adjustment Modal (Section 22) */}
      {adjustingRecord && (
        <Modal
          isOpen={!!adjustingRecord}
          onClose={() => setAdjustingRecord(null)}
          title={`Manual Balance Adjustment — ${adjustingRecord.employeeName}`}
          maxWidth="520px"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setAdjustingRecord(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmAdjust}>
                Apply Adjustment
              </Button>
            </>
          }
        >
          <form onSubmit={handleConfirmAdjust}>
            <div
              style={{
                padding: "14px",
                background: "var(--background)",
                borderRadius: "var(--radius-md)",
                marginBottom: "18px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                fontSize: "13px",
              }}
            >
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Employee:</span>
                <div style={{ fontWeight: "700" }}>{adjustingRecord.employeeName}</div>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Leave Type:</span>
                <div style={{ fontWeight: "700" }}>{adjustingRecord.leaveType}</div>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Current Balance:</span>
                <div style={{ fontWeight: "800", color: "var(--primary)", fontSize: "16px" }}>
                  {adjustingRecord.remaining} Days
                </div>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>New Balance Preview:</span>
                <div style={{ fontWeight: "800", color: "var(--success)", fontSize: "16px" }}>
                  {Math.max(0, adjustingRecord.remaining + Number(adjustmentValue))} Days
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Adjustment Value (+ or - days) <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                className="form-control"
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(e.target.value)}
                placeholder="e.g. 2 or -1"
                required
              />
              <span className="form-hint">
                Enter a positive number to add quota (e.g. comp-off), or a negative number to reduce.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Reason / Justification <span className="required">*</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="State reason (e.g. Spot award, weekend deployment comp-off, policy rollover)..."
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
