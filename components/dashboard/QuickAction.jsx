"use client";

import Link from "next/link";

export default function QuickAction({
  title,
  description,
  href,
  onClick,
  icon: Icon,
  color = "#2563EB",
}) {
  const content = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "16px",
        borderRadius: "var(--radius-lg)",
        background: "#FFFFFF",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "var(--radius-md)",
          background: `${color}15`,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {Icon && <Icon size={22} />}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>{title}</span>
        {description && (
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{description}</span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
}
