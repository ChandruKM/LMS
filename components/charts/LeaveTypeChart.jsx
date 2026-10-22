"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChart as PieIcon } from "lucide-react";

export default function LeaveTypeChart({ data = [] }) {
  const chartData = (Array.isArray(data) ? data : []).filter((d) => (d.value || 0) > 0);

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
          <PieIcon size={22} />
        </div>
        <h5 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)", margin: "0 0 4px" }}>
          No Leave Distribution Yet
        </h5>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, maxWidth: "320px" }}>
          Leave type breakdown will appear here once approved leave applications are recorded.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || "#2563EB"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value} Days`, "Usage"]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
