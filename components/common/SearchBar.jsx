"use client";

import { Search, X } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  style = {},
}) {
  return (
    <div className={`topbar-search ${className}`} style={{ minWidth: "240px", ...style }}>
      <Search size={16} className="topbar-search-icon" />
      <input
        type="text"
        className="topbar-search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          style={{
            position: "absolute",
            right: "10px",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
