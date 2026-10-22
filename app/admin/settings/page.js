"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { updateSettings, updateNotificationConfig, resetSettingsState } from "../../../redux/slices/settingsSlice";
import { updateProfile } from "../../../redux/slices/authSlice";
import { resetLeavesState } from "../../../redux/slices/leaveSlice";
import { resetEmployeeState } from "../../../redux/slices/employeeSlice";
import { resetPolicyState } from "../../../redux/slices/policySlice";
import { clearAllLmsStorage } from "../../../redux/localStorageHelper";
import { useToast } from "../../providers";
import Button from "../../../components/common/Button";
import ProfilePictureUploader from "../../../components/common/ProfilePictureUploader";
import {
  Settings,
  Building,
  Bell,
  User,
  Lock,
  Save,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Clock,
} from "lucide-react";

export default function AdminSettingsPage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.settings);

  // General Settings Form
  const [orgName, setOrgName] = useState(settings?.organizationName || "ApexTech Inc.");
  const [companyEmail, setCompanyEmail] = useState(settings?.companyEmail || "hr@apextech.com");
  const [dailyHours, setDailyHours] = useState(settings?.dailyWorkHours || 8);
  const [fiscalYearStart, setFiscalYearStart] = useState(settings?.fiscalYearStart || "January");

  const [workingDays, setWorkingDays] = useState(
    settings?.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  );

  // Notifications Config Form
  const [notifConfig, setNotifConfig] = useState(
    settings?.notifications || {
      approvalNotification: true,
      rejectionNotification: true,
      upcomingLeaveReminder: true,
      emailAlerts: true,
    }
  );

  // Admin Profile Form
  const [adminName, setAdminName] = useState(user?.name || "Admin User");
  const [adminEmail, setAdminEmail] = useState(user?.email || "admin@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const allWeekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleWorkingDayToggle = (day) => {
    if (workingDays.includes(day)) {
      if (workingDays.length <= 1) {
        addToast("At least one working day must be enabled.", "error");
        return;
      }
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    dispatch(
      updateSettings({
        organizationName: orgName,
        companyEmail,
        dailyWorkHours: Number(dailyHours),
        fiscalYearStart,
        workingDays,
        weekendDays: allWeekDays.filter((d) => !workingDays.includes(d)),
      })
    );
    addToast("General organization settings saved successfully.", "success");
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    dispatch(updateNotificationConfig(notifConfig));
    addToast("Notification rules updated.", "success");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      addToast("New passwords do not match.", "error");
      return;
    }

    dispatch(updateProfile({ name: adminName, email: adminEmail }));
    addToast("Administrator profile updated successfully.", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleResetSystem = () => {
    if (confirm("Reset the entire Leave Management System back to default demo state?")) {
      clearAllLmsStorage();
      dispatch(resetSettingsState());
      dispatch(resetLeavesState());
      dispatch(resetEmployeeState());
      dispatch(resetPolicyState());
      addToast("Factory demo data restored.", "success");
    }
  };

  return (
    <DashboardLayout requiredRole="Administrator">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
            <Settings size={24} color="var(--primary)" /> System & Organization Settings
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Configure corporate working hours, calendar workdays, notification rules, and admin security credentials.
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={RotateCcw} onClick={handleResetSystem}>
          Reset Demo Data
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px" }}>
        {/* Section 26: General Settings */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "18px" }}>
            <Building size={18} color="var(--primary)" /> General Organization
          </h3>

          <form onSubmit={handleSaveGeneral}>
            <div className="form-group">
              <label className="form-label">Organization Name</label>
              <input
                type="text"
                className="form-control"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">HR / Corporate Contact Email</label>
              <input
                type="email"
                className="form-control"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Daily Work Hours</label>
                <input
                  type="number"
                  className="form-control"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(e.target.value)}
                  min={4}
                  max={12}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fiscal Year Start</label>
                <select
                  className="form-control"
                  value={fiscalYearStart}
                  onChange={(e) => setFiscalYearStart(e.target.value)}
                >
                  <option value="January">January</option>
                  <option value="April">April</option>
                  <option value="July">July</option>
                  <option value="October">October</option>
                </select>
              </div>
            </div>

            {/* Working days & weekend config */}
            <div className="form-group">
              <label className="form-label">Working Days Configuration</label>
              <span className="form-hint" style={{ marginBottom: "8px", display: "block" }}>
                Unchecked days are treated as official weekends when calculating leaves.
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {allWeekDays.map((day) => {
                  const isWorking = workingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleWorkingDayToggle(day)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "var(--radius-md)",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: isWorking ? "var(--primary-light)" : "var(--background)",
                        color: isWorking ? "var(--primary)" : "var(--text-muted)",
                        border: isWorking ? "1px solid var(--primary-border)" : "1px solid var(--border)",
                        cursor: "pointer",
                      }}
                    >
                      {day} {isWorking ? "✓" : "—"}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" variant="primary" icon={Save} style={{ marginTop: "10px" }}>
              Save General Settings
            </Button>
          </form>
        </div>

        {/* Section 26: Notification Settings */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "18px" }}>
            <Bell size={18} color="var(--primary)" /> Notification Settings
          </h3>

          <form onSubmit={handleSaveNotifications}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "13px" }}>Leave Approval Notification</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    Notify employees immediately when their request is approved
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifConfig.approvalNotification}
                    onChange={(e) =>
                      setNotifConfig({ ...notifConfig, approvalNotification: e.target.checked })
                    }
                  />
                  <span className="slider" />
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "13px" }}>Leave Rejection Notification</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    Dispatch notification with manager remarks when a request is declined
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifConfig.rejectionNotification}
                    onChange={(e) =>
                      setNotifConfig({ ...notifConfig, rejectionNotification: e.target.checked })
                    }
                  />
                  <span className="slider" />
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "13px" }}>Upcoming Leave Reminder</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    Remind staff and managers 24 hours prior to scheduled leave start
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifConfig.upcomingLeaveReminder}
                    onChange={(e) =>
                      setNotifConfig({ ...notifConfig, upcomingLeaveReminder: e.target.checked })
                    }
                  />
                  <span className="slider" />
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "13px" }}>Email Alerts Simulator</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    Simulate sending corporate email dispatch triggers
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifConfig.emailAlerts}
                    onChange={(e) =>
                      setNotifConfig({ ...notifConfig, emailAlerts: e.target.checked })
                    }
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>

            <Button type="submit" variant="primary" icon={Save}>
              Save Notification Preferences
            </Button>
          </form>
        </div>

        {/* Section 26: Administrator Profile & Password */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <h3 className="card-title" style={{ marginBottom: "18px" }}>
            <User size={18} color="var(--primary)" /> Administrator Credentials & Security
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              padding: "16px 20px",
              background: "var(--background)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              marginBottom: "20px",
            }}
          >
            <ProfilePictureUploader size={80} showChangeButton={true} targetUser={user} />
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 4px", color: "var(--text-main)" }}>
                {user?.name || "System Administrator"}
              </h4>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0 }}>
                ApexTech Master Administrator &bull; Profile photo updates live across all management panels.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Admin Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Admin Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter current password (123)"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <Button type="submit" variant="primary" icon={Save}>
                Update Security Settings
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
