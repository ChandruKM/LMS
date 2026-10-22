"use client";

export default function StatusBadge({ status, size = "md" }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let badgeClass = "badge-pending";
  if (normalized === "approved") badgeClass = "badge-approved";
  else if (normalized === "rejected") badgeClass = "badge-rejected";
  else if (normalized === "cancelled") badgeClass = "badge-cancelled";
  else if (normalized === "active") badgeClass = "badge-active";
  else if (normalized === "inactive") badgeClass = "badge-inactive";

  return (
    <span className={`badge ${badgeClass} ${size === "sm" ? "text-xs py-0.5 px-2" : ""}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}
