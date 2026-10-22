"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { updateProfile } from "../../../redux/slices/authSlice";
import { editEmployee } from "../../../redux/slices/employeeSlice";
import { apiClient } from "../../../lib/apiClient";
import { useToast } from "../../providers";
import Button from "../../../components/common/Button";
import ProfilePictureUploader from "../../../components/common/ProfilePictureUploader";
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
  Lock,
  Building,
  CheckCircle2,
  Calendar,
  Users,
} from "lucide-react";

export default function AdminProfilePage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { employees } = useSelector((state) => state.employees);
  const { policies } = useSelector((state) => state.policies);

  const [name, setName] = useState(user?.name || "Admin User");
  const [email, setEmail] = useState(user?.email || "admin@example.com");
  const [phone, setPhone] = useState(user?.phone || "+1 (555) 890-1234");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const totalEmployees = employees?.length || 0;
  const activePolicies = policies?.filter((p) => p.enabled)?.length || 0;

  const handleSave = async (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      addToast("New passwords do not match. Please re-enter.", "error");
      return;
    }

    setSaving(true);
    const updated = {
      name,
      email,
      phone,
    };

    if (newPassword) {
      updated.password = newPassword;
    }

    dispatch(updateProfile(updated));
    if (user?.id) {
      dispatch(editEmployee({ id: user.id, ...updated }));
      apiClient.employees.update(user.id, updated).catch((err) =>
        console.warn("[Backend Sync] Admin update warning:", err.message)
      );
    }

    setTimeout(() => {
      setSaving(false);
      setNewPassword("");
      setConfirmPassword("");
      addToast("Administrator profile and credentials updated successfully.", "success");
    }, 400);
  };

  return (
    <DashboardLayout requiredRole="Administrator">
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Profile Card Header */}
        <div
          className="card"
          style={{
            padding: "32px",
            marginBottom: "24px",
            background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <ProfilePictureUploader size={92} showChangeButton={true} targetUser={user} />

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-main)" }}>
                {user?.name || "System Administrator"}
              </h2>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  background: "#FEF3C7",
                  color: "#B45309",
                  padding: "3px 10px",
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Shield size={12} />
                Administrator
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
              {user?.position || "Chief People Officer & HR Admin"} &bull; {user?.department || "Administration"}
            </p>
            <div style={{ display: "flex", gap: "16px", marginTop: "12px", fontSize: "12px", color: "var(--text-muted)", flexWrap: "wrap" }}>
              <span>ID: <strong>{user?.id || "ADM001"}</strong></span>
              <span>Organization: <strong>ApexTech Inc.</strong></span>
              <span>Joined: <strong>{user?.joiningDate || "2019-01-01"}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick System Metric Badges */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
              Employees Managed
            </div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "var(--primary)", marginTop: "4px" }}>
              {totalEmployees}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Active company roster
            </div>
          </div>

          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
              Active Leave Policies
            </div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#10B981", marginTop: "4px" }}>
              {activePolicies}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Configured entitlement rules
            </div>
          </div>

          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
              Platform Security
            </div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#8B5CF6", marginTop: "4px" }}>
              Enforced
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Role-based access active
            </div>
          </div>
        </div>

        {/* Profile Edit & Security Form */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "20px" }}>
            <User size={18} color="var(--primary)" /> Administrator Information & Security
          </h3>

          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: "36px" }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Work Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--text-muted)" }} />
                  <input
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: "36px" }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--text-muted)" }} />
                  <input
                    type="tel"
                    className="form-control"
                    style={{ paddingLeft: "36px" }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department (Read-only)</label>
                <input
                  type="text"
                  className="form-control"
                  value={user?.department || "Administration"}
                  disabled
                  style={{ background: "var(--background)", cursor: "not-allowed" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (leave blank to keep current)</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--text-muted)" }} />
                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: "36px" }}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--text-muted)" }} />
                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: "36px" }}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <Button type="submit" variant="primary" icon={Save} loading={saving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
