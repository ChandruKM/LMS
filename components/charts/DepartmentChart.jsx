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
import { Building } from "lucide-react";

export default function DepartmentChart({ data = [] }) {
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
          <Building size={22} />
        </div>
        <h5 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)", margin: "0 0 4px" }}>
          No Department Data Yet
        </h5>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, maxWidth: "320px" }}>
          Department usage figures will populate here once leave requests are logged by departments.
        </p>
      </div>
    );
  }

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
            dataKey="department"
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
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              fontSize: "12px",
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
          />
          <Bar
            dataKey="approved"
            name="Approved Days"
            fill="#2563EB"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="pending"
            name="Pending Days"
            fill="#F59E0B"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
