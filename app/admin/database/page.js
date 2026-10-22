"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import Button from "../../../components/common/Button";
import { Database, Play, Table, RefreshCw, Terminal, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminDatabasePage() {
  const [tables, setTables] = useState([
    "employees",
    "leave_requests",
    "leave_balances",
    "policies",
    "notifications",
    "balance_adjustments",
    "settings",
  ]);
  const [selectedTable, setSelectedTable] = useState("employees");
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [customSql, setCustomSql] = useState("SELECT * FROM leave_requests ORDER BY applied_date DESC LIMIT 10;");
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState("");

  const loadTable = async (tableName) => {
    setLoading(true);
    setQueryError("");
    try {
      const res = await fetch(`/api/db/query?table=${tableName}`);
      const data = await res.json();
      if (data.success) {
        setRows(data.data);
        setTotalRows(data.totalRows);
        if (data.tables) setTables(data.tables);
      } else {
        setQueryError(data.error);
      }
    } catch (err) {
      setQueryError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTable(selectedTable);
  }, [selectedTable]);

  const handleRunCustomSql = async (e) => {
    e.preventDefault();
    if (!customSql.trim()) return;

    setLoading(true);
    setQueryError("");
    setQueryResult(null);
    try {
      const res = await fetch("/api/db/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: customSql }),
      });
      const data = await res.json();
      if (data.success) {
        setQueryResult(data);
      } else {
        setQueryError(data.error);
      }
    } catch (err) {
      setQueryError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <DashboardLayout requiredRole="Administrator">
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
              <Database size={24} color="var(--primary)" /> SQL Database Explorer
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Live inspection of SQLite database tables and schema located at <code>database/lms.db</code>.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={() => loadTable(selectedTable)}
            loading={loading}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Database File Location Info Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          color: "#FFFFFF",
          borderRadius: "var(--radius-lg)",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "13px",
        }}
      >
        <div>
          <span style={{ color: "#38BDF8", fontWeight: "700" }}>Physical Database File:</span>{" "}
          <code style={{ background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: "4px" }}>
            LMS/database/lms.db
          </code>
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>
          Engine: <strong>SQLite (native Node.js v24 engine)</strong>
        </div>
      </div>

      {/* SQL Query Console Card */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <h3 className="card-title">
            <Terminal size={18} color="var(--primary)" /> Execute SQL Query
          </h3>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Run direct SELECT, INSERT, UPDATE, or PRAGMA queries
          </span>
        </div>

        <form onSubmit={handleRunCustomSql}>
          <div className="form-group">
            <textarea
              className="form-control"
              rows={3}
              style={{ fontFamily: "monospace", fontSize: "13px" }}
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              placeholder="e.g. SELECT * FROM employees;"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* Quick Query Templates */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                "SELECT * FROM leave_requests WHERE status = 'Approved';",
                "SELECT employee_id, leave_type, used, remaining FROM leave_balances;",
                "SELECT * FROM employees;",
              ].map((query, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCustomSql(query)}
                  style={{
                    fontSize: "11px",
                    padding: "4px 8px",
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                  }}
                >
                  Template {idx + 1}
                </button>
              ))}
            </div>

            <Button type="submit" variant="primary" size="sm" icon={Play} loading={loading}>
              Run SQL Query
            </Button>
          </div>
        </form>

        {queryError && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              background: "var(--danger-bg)",
              color: "var(--danger)",
              borderRadius: "var(--radius-md)",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} /> {queryError}
          </div>
        )}

        {queryResult && queryResult.isSelect && (
          <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
              Returned <strong>{queryResult.rowCount}</strong> row(s) from SQL:
            </div>
            <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {queryResult.data.length > 0 &&
                      Object.keys(queryResult.data[0]).map((col) => <th key={col}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {queryResult.data.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {Object.values(row).map((val, cIdx) => (
                        <td key={cIdx} style={{ fontSize: "12px" }}>
                          {val !== null && val !== undefined ? String(val) : <em>null</em>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {queryResult && !queryResult.isSelect && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              background: "var(--success-bg)",
              color: "var(--success)",
              borderRadius: "var(--radius-md)",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle2 size={16} /> Query executed successfully. Changes affected: {queryResult.changes}
          </div>
        )}
      </div>

      {/* Table Selector Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {tables.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setSelectedTable(t)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              background: selectedTable === t ? "var(--primary)" : "#FFFFFF",
              color: selectedTable === t ? "#FFFFFF" : "var(--text-secondary)",
              border: selectedTable === t ? "none" : "1px solid var(--border)",
              boxShadow: selectedTable === t ? "var(--shadow-sm)" : "none",
            }}
          >
            <Table size={14} />
            {t}
          </button>
        ))}
      </div>

      {/* Table Content Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              Table: <span style={{ color: "var(--primary)" }}>{selectedTable}</span>
            </h3>
            <p className="card-subtitle">
              Total rows stored in SQLite: <strong>{totalRows}</strong>
            </p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
            Table is empty.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {columns.map((col) => (
                      <td key={col} style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : <em>null</em>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
