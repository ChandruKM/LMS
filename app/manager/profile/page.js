"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { updateProfile } from "../../../redux/slices/authSlice";
import { editEmployee } from "../../../redux/slices/employeeSlice";
import { useToast } from "../../providers";
import Button from "../../../components/common/Button";
import ProfilePictureUploader from "../../../components/common/ProfilePictureUploader";
import { User, Mail, Phone, Save, Users, Calendar } from "lucide-react";

export default function ManagerProfilePage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { employees } = useSelector((state) => state.employees);

  const teamCount = employees.filter((e) => e.role === "Employee").length;

  const [name, setName] = useState(user?.name || "Robert Fox");
  const [email, setEmail] = useState(user?.email || "robert@example.com");
  const [phone, setPhone] = useState(user?.phone || "+1 (555) 789-0123");
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    const updated = { name, email, phone };
    dispatch(updateProfile(updated));
    dispatch(editEmployee({ id: user?.id || "MGR001", ...updated }));

    setTimeout(() => {
      setSaving(false);
      addToast("Manager profile updated successfully.", "success");
    }, 400);
  };

  return (
    <DashboardLayout requiredRole="Manager">
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Profile Card Header */}
        <div
          className="card"
          style={{
            padding: "32px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <ProfilePictureUploader size={92} showChangeButton={true} targetUser={user} />

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "800" }}>{user?.name}</h2>
              <span className="badge badge-pending">Manager / Supervisor</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
              {user?.position || "Engineering Director"} &bull; {user?.department}
            </p>
            <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
              <span>ID: <strong>{user?.id}</strong></span>
              <span>Managing: <strong>{teamCount} Team Members</strong></span>
              <span>Joined: <strong>{user?.joiningDate}</strong></span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "18px" }}>
            <User size={18} color="var(--primary)" /> Manager Account Details
          </h3>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Button type="submit" variant="primary" icon={Save} loading={saving} style={{ marginTop: "10px" }}>
              Update Profile
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
