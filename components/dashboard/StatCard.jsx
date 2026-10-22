"use client";

export default function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  color = "#2563EB",
  trend,
  trendType = "neutral", // "up", "down", "neutral"
}) {
  return (
    <div className="stat-card">
      <div
        className="stat-icon"
        style={{
          backgroundColor: `${color}15`,
          color: color,
        }}
      >
        {Icon && <Icon size={26} />}
      </div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <div className="stat-value">{value}</div>
        {subtext && (
          <span className="stat-subtext" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {trend && (
              <span
                style={{
                  fontWeight: "600",
                  color: trendType === "up" ? "var(--success)" : trendType === "down" ? "var(--danger)" : "var(--text-secondary)",
                }}
              >
                {trend}
              </span>
            )}
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
