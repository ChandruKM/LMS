"use client";

import { Inbox } from "lucide-react";
import Button from "./Button";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "No data found",
  description = "There are no records matching your current filter criteria.",
  actionText,
  onAction,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-desc">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
