"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { login, clearAuthError, completePasswordChange, dismissPasswordChange } from "../../redux/slices/authSlice";
import { editEmployee } from "../../redux/slices/employeeSlice";
import { useToast } from "../providers";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import apiClient from "../../lib/apiClient";
import {
  CalendarCheck2,
  Lock,
  User,
  Shield,
  ArrowRight,
  Briefcase,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Building2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user, isAuthenticated, error } = useSelector((state) => state.auth);
  const { employees } = useSelector((state) => state.employees);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(""); // No role selected by default - must be manually selected
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  // First Login / Optional Password Change state
  const [mustChangeModalOpen, setMustChangeModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const navigateToRoleDashboard = useCallback(
    (targetUser) => {
      const userRole = targetUser?.role || role;
      if (userRole === "Administrator") {
        router.push("/admin/dashboard");
      } else if (userRole === "Manager") {
        router.push("/manager/dashboard");
      } else {
        router.push("/employee/dashboard");
      }
    },
    [role, router]
  );

  // Check login credentials and determine if password change is available
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.mustChangePassword) {
        const timer = setTimeout(() => {
          setMustChangeModalOpen(true);
          setPasswordChangeError("");
        }, 0);
        return () => clearTimeout(timer);
      } else {
        addToast(`Signed in successfully as ${user.name}`, "success");
        navigateToRoleDashboard(user);
      }
    }
  }, [isAuthenticated, user, addToast, navigateToRoleDashboard]);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    if (!role) {
      addToast("Please select your access role (Employee, Manager, or Administrator) first.", "error");
      return;
    }

    if (!username.trim() || !password.trim()) {
      addToast("Please provide both username and password.", "error");
      return;
    }

    dispatch(login({ username: username.trim(), password: password.trim(), role, employees }));
  };

  const handleSkipPasswordChange = async () => {
    try {
      if (user?.id) {
        await apiClient.auth.skipPasswordChange(user.id).catch((err) =>
          console.warn("[Backend Sync] Skip password sync error:", err.message)
        );
      }
    } catch (err) {
      // Ignore network errors on offline/local fallback
    }

    dispatch(dismissPasswordChange());
    if (user?.id) {
      dispatch(editEmployee({ id: user.id, mustChangePassword: false }));
    }

    addToast(`Welcome, ${user?.name}! Continuing with current password.`, "info");
    setMustChangeModalOpen(false);
    navigateToRoleDashboard(user);
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPasswordChangeError("");

    if (!newPassword || newPassword.length < 3) {
      setPasswordChangeError("New password must be at least 3 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordChangeError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsChangingPassword(true);
    try {
      if (user?.id) {
        await apiClient.auth.changePassword(user.id, newPassword).catch((err) =>
          console.warn("[Backend Sync] Password change sync error:", err.message)
        );
      }

      dispatch(completePasswordChange(newPassword));
      if (user?.id) {
        dispatch(editEmployee({ id: user.id, password: newPassword, mustChangePassword: false }));
      }

      addToast("Password set successfully! Welcome to your ApexTech dashboard.", "success");
      setMustChangeModalOpen(false);
      navigateToRoleDashboard(user);
    } catch (err) {
      setPasswordChangeError(err.message || "Failed to update password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #EEF2F6 100%)",
        padding: "32px 16px",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Main Dual-Column Executive Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "1060px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          background: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px #E2E8F0",
          overflow: "hidden",
        }}
      >
        {/* ================= LEFT SIDE: APEXTECH HERO BRANDING ================= */}
        <div
          style={{
            background: "linear-gradient(145deg, #0F172A 0%, #1E3A8A 52%, #2563EB 100%)",
            color: "#FFFFFF",
            padding: "52px 44px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle Glow Circle */}
          <div
            style={{
              position: "absolute",
              top: "-80px",
              right: "-80px",
              width: "260px",
              height: "260px",
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Logo & Brand Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "36px" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%)",
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
                  flexShrink: 0,
                }}
              >
                <CalendarCheck2 size={28} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h1 style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px", margin: 0, color: "#FFFFFF" }}>
                    ApexTech
                  </h1>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      background: "rgba(59, 130, 246, 0.3)",
                      border: "1px solid rgba(147, 197, 253, 0.4)",
                      padding: "2px 8px",
                      borderRadius: "100px",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      color: "#93C5FD",
                    }}
                  >
                    Enterprise
                  </span>
                </div>
                <span style={{ fontSize: "12px", color: "#CBD5E1", fontWeight: "500" }}>
                  Workforce & Leave Management Suite
                </span>
              </div>
            </div>

            {/* Pitch Heading & Description */}
            <h2
              style={{
                fontSize: "26px",
                fontWeight: "700",
                lineHeight: "1.3",
                marginBottom: "16px",
                color: "#FFFFFF",
                letterSpacing: "-0.4px",
              }}
            >
              Streamline your workplace absence lifecycle with ApexTech.
            </h2>
            <p style={{ fontSize: "14px", color: "#E2E8F0", lineHeight: "1.65", marginBottom: "32px", opacity: 0.95 }}>
              A unified system for employee self-service leave requests, automated manager approvals, real-time quota calculations, and executive HR compliance reports.
            </p>

            {/* Feature Highlights */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { title: "Role-Based Portals", desc: "Dedicated views for Employees, Managers & Administrators" },
                { title: "Live Quota Deductions", desc: "Automated calculations for Sick, Casual, and Vacation leaves" },
                { title: "Structured Approvals", desc: "One-click manager reviews with remark tracking and audit logs" },
                { title: "Executive HR Reports", desc: "Organization-wide calendars, absence heatmaps & department analytics" },
              ].map((feat, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "rgba(147, 197, 253, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    <CheckCircle2 size={15} color="#93C5FD" />
                  </div>
                  <div style={{ fontSize: "13px" }}>
                    <strong style={{ color: "#FFFFFF", fontWeight: "600" }}>{feat.title}: </strong>
                    <span style={{ color: "#CBD5E1" }}>{feat.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Badge Card */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              marginTop: "44px",
              padding: "16px 18px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <ShieldCheck size={24} color="#93C5FD" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: "12px", lineHeight: "1.5" }}>
              <strong style={{ color: "#FFFFFF" }}>ApexTech Enterprise Security: </strong>
              <span style={{ color: "#CBD5E1" }}>
                Role-based access controls, encrypted credentials, and centralized administrator oversight.
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: AUTHENTICATION FORM ================= */}
        <div
          style={{
            padding: "52px 44px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "#FFFFFF",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: "26px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "6px",
                background: "var(--primary-light)",
                color: "var(--primary)",
                fontSize: "12px",
                fontWeight: "600",
                marginBottom: "12px",
                border: "1px solid var(--primary-border)",
              }}
            >
              <Building2 size={13} />
              <span>ApexTech Workplace SSO</span>
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "var(--text-main)",
                letterSpacing: "-0.4px",
                margin: "0 0 6px 0",
              }}
            >
              Sign In to Your Workspace
            </h2>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", margin: 0 }}>
              Select your role and provide your authorized ApexTech credentials.
            </p>
          </div>


          {/* Error Banner */}
          {error && (
            <div
              style={{
                padding: "12px 14px",
                background: "var(--danger-bg)",
                border: "1px solid var(--danger-border)",
                color: "var(--danger)",
                borderRadius: "10px",
                fontSize: "13px",
                marginBottom: "20px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Role Selector Tabs */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                  marginBottom: "8px",
                }}
              >
                Access Role
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "6px",
                  background: "#F8FAFC",
                  padding: "4px",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                }}
              >
                {[
                  { id: "Employee", label: "Employee", icon: User },
                  { id: "Manager", label: "Manager", icon: Briefcase },
                  { id: "Administrator", label: "Admin", icon: Shield },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleRoleSelect(item.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "9px 6px",
                        borderRadius: "8px",
                        border: isSelected ? "2px solid var(--primary)" : "1px solid transparent",
                        background: isSelected ? "var(--primary-light)" : "transparent",
                        color: isSelected ? "var(--primary)" : "var(--text-secondary)",
                        boxShadow: isSelected ? "0 2px 6px rgba(37, 99, 235, 0.12)" : "none",
                        fontSize: "13px",
                        fontWeight: isSelected ? "700" : "500",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Icon size={14} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Username Field (derived from mail ID) */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label
                  htmlFor="login-username"
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text-main)",
                    margin: 0,
                  }}
                >
                  Username
                </label>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Derived from your email ID (before @)
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  id="login-username"
                  type="text"
                  className="form-control"
                  style={{
                    paddingLeft: "42px",
                    height: "46px",
                    fontSize: "14px",
                    borderRadius: "10px",
                    borderColor: "var(--border)",
                  }}
                  placeholder="Enter your username (e.g. admin or john)"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) dispatch(clearAuthError());
                  }}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label
                  htmlFor="login-password"
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text-main)",
                    margin: 0,
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  style={{
                    fontSize: "12px",
                    color: "var(--primary)",
                    fontWeight: "600",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  style={{
                    paddingLeft: "42px",
                    paddingRight: "44px",
                    height: "46px",
                    fontSize: "14px",
                    borderRadius: "10px",
                    borderColor: "var(--border)",
                  }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) dispatch(clearAuthError());
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Primary Sign-in Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              style={{
                width: "100%",
                height: "48px",
                fontSize: "14.5px",
                fontWeight: "700",
                borderRadius: "10px",
                marginTop: "4px",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
              }}
            >
              {role ? `Sign In to ${role === "Administrator" ? "Admin" : role} Portal` : "Sign In to Portal"}
            </Button>
          </form>

          {/* Bottom Portal Reassurance */}
          <div
            style={{
              marginTop: "26px",
              paddingTop: "18px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "var(--text-secondary)",
              fontSize: "12px",
            }}
          >
            <ShieldCheck size={15} color="var(--primary)" />
            <span>ApexTech Enterprise IAM • Secure Role Authentication</span>
          </div>
        </div>
      </div>

      {/* ================= MODAL: FIRST LOGIN PASSWORD CHANGE (OPTIONAL) ================= */}
      <Modal
        isOpen={mustChangeModalOpen}
        onClose={handleSkipPasswordChange}
        title="ApexTech Security — Password Setup (Optional)"
        maxWidth="500px"
        footer={
          <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "flex-end" }}>
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={handleSkipPasswordChange}
              style={{ flex: 1, height: "42px", fontWeight: "600" }}
            >
              Keep 123 & Continue
            </Button>
            <Button
              variant="primary"
              size="md"
              type="button"
              onClick={handlePasswordChangeSubmit}
              loading={isChangingPassword}
              style={{ flex: 1, height: "42px", fontWeight: "600" }}
            >
              Save New Password
            </Button>
          </div>
        }
      >
        <div style={{ padding: "4px 0" }}>
          <div
            style={{
              padding: "14px 16px",
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: "10px",
              marginBottom: "18px",
              fontSize: "13px",
              color: "#1E40AF",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              lineHeight: "1.5",
            }}
          >
            <KeyRound size={20} style={{ flexShrink: 0, marginTop: "2px", color: "var(--primary)" }} />
            <div>
              <strong style={{ display: "block", marginBottom: "2px" }}>Optional First Login Password Update</strong>
              Your account is currently configured with the default password (<code>123</code>).
              You can set your own private password now, or skip and continue to your dashboard with <code>123</code>.
            </div>
          </div>

          {passwordChangeError && (
            <div
              style={{
                padding: "10px 14px",
                background: "var(--danger-bg)",
                border: "1px solid var(--danger-border)",
                color: "var(--danger)",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{passwordChangeError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChangeSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                  marginBottom: "6px",
                }}
              >
                New Permanent Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-control"
                  style={{ height: "42px", paddingRight: "40px" }}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                  marginBottom: "6px",
                }}
              >
                Confirm New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  style={{ height: "42px", paddingRight: "40px" }}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                background: "#F8FAFC",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              <strong>Password Information:</strong>
              <ul style={{ paddingLeft: "18px", marginTop: "4px", margin: "4px 0 0" }}>
                <li>Minimum 3 characters in length</li>
                <li>You can keep the default <code>123</code> or update it at any time in your Profile.</li>
              </ul>
            </div>
          </form>
        </div>
      </Modal>

      {/* ================= MODAL: FORGOT PASSWORD RECOVERY ================= */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="ApexTech Security — Password Recovery"
        maxWidth="480px"
        footer={
          <Button variant="primary" size="md" onClick={() => setForgotModalOpen(false)} style={{ minWidth: "120px" }}>
            Understood
          </Button>
        }
      >
        <div style={{ padding: "8px 0" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "#FEF3C7",
              color: "#D97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Shield size={26} />
          </div>
          <h4 style={{ textAlign: "center", fontSize: "17px", fontWeight: "700", marginBottom: "8px", color: "var(--text-main)" }}>
            Centralized Administrator Reset Policy
          </h4>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", textAlign: "center" }}>
            In accordance with ApexTech enterprise compliance regulations, independent self-service password resets are disabled.
          </p>
          <div
            style={{
              marginTop: "18px",
              padding: "14px 16px",
              background: "var(--background)",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              fontSize: "12.5px",
              color: "var(--text-main)",
            }}
          >
            <strong style={{ display: "block", marginBottom: "6px" }}>How to reset your password:</strong>
            <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px", margin: 0 }}>
              <li>
                Contact your <strong>HR Department</strong> or <strong>System Administrator</strong>.
              </li>
              <li>
                The Administrator will reset your account password in the <strong>Admin &gt; Employees</strong> roster.
              </li>
              <li>
                Your account password will be reset to the default <code>123</code>, and you will have the option to configure a new personal password on your next login.
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}
