"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { updateProfile } from "../../../redux/slices/authSlice";
import { editEmployee } from "../../../redux/slices/employeeSlice";
import { useToast } from "../../providers";
import Button from "../../../components/common/Button";
import ProfilePictureUploader from "../../../components/common/ProfilePictureUploader";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Shield,
  Save,
  CheckCircle2,
} from "lucide-react";

export default function EmployeeProfilePage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { balances } = useSelector((state) => state.employees);

  const employeeId = user?.id || "EMP001";
  const myBalances = balances.filter((b) => b.employeeId === employeeId);

  const [name, setName] = useState(user?.name || "John Doe");
  const [email, setEmail] = useState(user?.email || "john@example.com");
  const [phone, setPhone] = useState(user?.phone || "+1 (555) 234-5678");
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);

    const updated = {
      name,
      email,
      phone,
    };

    dispatch(updateProfile(updated));
    dispatch(editEmployee({ id: employeeId, ...updated }));

    setTimeout(() => {
      setSaving(false);
      addToast("Profile details updated successfully.", "success");
    }, 400);
  };

  return (
    <DashboardLayout requiredRole="Employee">
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Profile Header Card */}
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
                {user?.name}
              </h2>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  padding: "3px 10px",
                  borderRadius: "9999px",
                }}
              >
                {user?.role}
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
              {user?.position || "Software Engineer"} &bull; {user?.department}
            </p>
            <div style={{ display: "flex", gap: "16px", marginTop: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
              <span>ID: <strong>{user?.id}</strong></span>
              <span>Reporting Manager: <strong>{user?.manager || "Robert"}</strong></span>
              <span>Joined: <strong>{user?.joiningDate || "2023-03-15"}</strong></span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form & Leave Quota Overview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
          {/* Edit Form */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: "18px" }}>
              <User size={18} color="var(--primary)" /> Personal Information
            </h3>

            <form onSubmit={handleSave}>
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
                <label className="form-label">Email Address</label>
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
                  value={user?.department}
                  disabled
                  style={{ background: "var(--background)", cursor: "not-allowed" }}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                icon={Save}
                loading={saving}
                style={{ width: "100%", marginTop: "8px" }}
              >
                Save Profile Changes
              </Button>
            </form>
          </div>

          {/* Quota Summary Card */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: "18px" }}>
              <Briefcase size={18} color="var(--primary)" /> Leave Quota Overview
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {myBalances.map((b) => (
                <div
                  key={b.leaveType}
                  style={{
                    padding: "12px 14px",
                    background: "var(--background)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "13px" }}>{b.leaveType}</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {b.used} days taken of {b.entitlement} days total
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "16px", fontWeight: "800", color: "var(--primary)" }}>
                      {b.remaining}
                    </span>
                    <div style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                      Remaining
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
