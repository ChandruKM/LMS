"use client";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  className = "",
  disabled = false,
  ...props
}) {
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  const variantClass = `btn-${variant}`;

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="spinner" style={{
          width: "16px",
          height: "16px",
          border: "2px solid currentColor",
          borderRightColor: "transparent",
          borderRadius: "50%",
          display: "inline-block",
          animation: "spin 0.6s linear infinite"
        }} />
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon size={size === "sm" ? 14 : 16} />}
          {children}
          {Icon && iconPosition === "right" && <Icon size={size === "sm" ? 14 : 16} />}
        </>
      )}
    </button>
  );
}
