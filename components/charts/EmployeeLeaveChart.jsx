"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users } from "lucide-react";

export default function EmployeeLeaveChart({ data = [] }) {
  const chartData = Array.isArray(data) ? data : [];

  if (chartData.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: 280,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background)",
          borderRadius: "10px",
          border: "1px dashed var(--border)",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "var(--primary-light)",
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <Users size={22} />
        </div>
        <h5 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)", margin: "0 0 4px" }}>
          No Registered Employees Found
        </h5>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, maxWidth: "320px" }}>
          Only registered employees appear in this chart. Data will update automatically as employees register and record leaves.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            padding: "10px 14px",
            fontSize: "12px",
          }}
        >
          <div style={{ fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
            {item.fullName || item.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#EF4444", marginBottom: "3px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#EF4444" }} />
            <span>Used Days: <strong>{item.used || 0}</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10B981" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }} />
            <span>Remaining Quota: <strong>{item.remaining || 0}</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, left: -20, bottom: 20 }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 11 }}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
          />
          <Bar
            dataKey="used"
            name="Days Used"
            fill="#EF4444"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="remaining"
            name="Days Remaining"
            fill="#10B981"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
