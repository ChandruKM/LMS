"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

export default function LeaveTrendChart({ data = [] }) {
  const chartData = Array.isArray(data) ? data : [];
  const hasData = chartData.some((d) => (d.leaves || 0) > 0 || (d.days || 0) > 0);

  if (!hasData) {
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
          <TrendingUp size={22} />
        </div>
        <h5 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)", margin: "0 0 4px" }}>
          No Trend History Yet
        </h5>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, maxWidth: "320px" }}>
          Monthly trend analysis will be displayed here as leaves are recorded over upcoming months.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="leaveTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="daysTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 12 }}
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
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="leaves"
            name="Leave Requests"
            stroke="#2563EB"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#leaveTrendGrad)"
          />
          <Area
            type="monotone"
            dataKey="days"
            name="Days Off"
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#daysTrendGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
