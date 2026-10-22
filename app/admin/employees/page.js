"use client";

import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import {
  addEmployee,
  editEmployee,
  toggleEmployeeStatus,
  resetEmployeePassword,
} from "../../../redux/slices/employeeSlice";
import { useToast } from "../../providers";
import Button from "../../../components/common/Button";
import SearchBar from "../../../components/common/SearchBar";
import Modal from "../../../components/common/Modal";
import EmptyState from "../../../components/common/EmptyState";
import ProfilePictureUploader from "../../../components/common/ProfilePictureUploader";
import apiClient from "../../../lib/apiClient";
import {
  Users,
  UserPlus,
  Edit3,
  Power,
  Eye,
  CheckCircle2,
  XCircle,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  Shield,
  Download,
  Key,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function AdminEmployeesPage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { employees, balances } = useSelector((state) => state.employees);

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);

  // Admin Reset Password Modal state
  const [resetModalEmp, setResetModalEmp] = useState(null);
  const [tempPassword, setTempPassword] = useState("123");
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  // Form states for Add Employee
  const [formData, setFormData] = useState({
    id: `EMP${employees.length.toString().padStart(3, "0")}`,
    name: "",
    email: "",
    phone: "",
    department: "Development",
    manager: "Admin User",
    joiningDate: new Date().toISOString().slice(0, 10),
    role: "Employee",
    position: "Software Engineer",
    status: "Active",
  });

  const departments = ["Development", "HR", "Finance", "Marketing", "Operations", "Management", "Administration"];
  const managers = employees.filter((e) => e.role === "Manager" || e.role === "Administrator");

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        emp.name.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q);

      const matchesDept = departmentFilter === "All" || emp.department === departmentFilter;
      const matchesStatus = statusFilter === "All" || emp.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchTerm, departmentFilter, statusFilter]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      addToast("Name and email are required fields.", "error");
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    const derivedUsername = cleanEmail.includes("@") ? cleanEmail.split("@")[0] : cleanEmail;
    const newEmp = {
      ...formData,
      email: cleanEmail,
      username: derivedUsername, // derived from employee's email id before @
      password: "123", // default login password
      mustChangePassword: true, // optional change prompt on first login
      avatar: `https://images.unsplash.com/photo-${1534528741775 + employees.length}?w=150&auto=format&fit=crop&q=80`,
    };

    dispatch(addEmployee(newEmp));
    addToast(`${newEmp.role} ${newEmp.name} (${newEmp.id}) added. Default username: ${derivedUsername}, password: 123.`, "success");
    setAddModalOpen(false);
    setFormData({
      id: `EMP${(employees.length + 1).toString().padStart(3, "0")}`,
      name: "",
      email: "",
      phone: "",
      department: "Development",
      manager: managers[0]?.name || "Admin User",
      joiningDate: new Date().toISOString().slice(0, 10),
      role: "Employee",
      position: "Associate",
      status: "Active",
    });
  };

  const handleResetPasswordSubmit = async (e) => {
    e?.preventDefault();
    if (!resetModalEmp) return;

    setIsResetting(true);
    try {
      // 1. Sync to backend API
      await apiClient.employees.resetPassword(resetModalEmp.id, tempPassword).catch((err) =>
        console.warn("[Backend Sync] Reset password API failed:", err.message)
      );

      // 2. Dispatch Redux update
      dispatch(resetEmployeePassword({ id: resetModalEmp.id, password: tempPassword }));

      setResetComplete(true);
      addToast(`Password reset successfully for ${resetModalEmp.name}.`, "success");
    } catch (err) {
      addToast(err.message || "Failed to reset password", "error");
    } finally {
      setIsResetting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!resetModalEmp) return;
    const derivedUser = resetModalEmp.username || (resetModalEmp.email?.includes("@") ? resetModalEmp.email.split("@")[0] : resetModalEmp.email);
    const text = `ApexTech LMS Login Credentials:\nUsername: ${derivedUser}\nEmail: ${resetModalEmp.email}\nPassword: ${tempPassword}\n\nNote: You have the option to update this password upon your next login or keep it.`;
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    addToast("Credentials copied to clipboard!", "info");
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (
      (editingEmployee.id === "ADM001" || editingEmployee.role === "Administrator") &&
      editingEmployee.status !== "Active"
    ) {
      addToast("Administrator account is protected and cannot be deactivated.", "error");
      return;
    }
    dispatch(editEmployee(editingEmployee));
    addToast(`Updated details for ${editingEmployee.name}.`, "success");
    setEditingEmployee(null);
  };

  const handleToggleStatus = (emp) => {
    if (emp.id === "ADM001" || emp.role === "Administrator") {
      addToast("Administrator account is protected and cannot be deactivated.", "error");
      return;
    }
    dispatch(toggleEmployeeStatus(emp.id));
    const nextStatus = emp.status === "Active" ? "Inactive" : "Active";
    addToast(`${emp.name} is now marked as ${nextStatus}. Historical records preserved.`, "info");
  };

  const handleExportCSV = () => {
    const headers = "Employee ID,Name,Email,Department,Manager,Role,Joining Date,Status\n";
    const rows = filteredEmployees
      .map((e) => `"${e.id}","${e.name}","${e.email}","${e.department}","${e.manager || ""}","${e.role}","${e.joiningDate}","${e.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Employees_Roster.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exported employees to CSV.", "success");
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
            <Users size={24} color="var(--primary)" /> Employee Management
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Manage organization members, assign reporting managers, monitor quotas, and toggle employment status.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => setAddModalOpen(true)}
          >
            + Add Employee
          </Button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: "20px" }}>
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="filters-group" style={{ flex: 1 }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, ID, or email..."
            />

            <select
              className="form-control"
              style={{ width: "auto", minWidth: "160px" }}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ width: "auto", minWidth: "130px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          {(searchTerm || departmentFilter !== "All" || statusFilter !== "All") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setDepartmentFilter("All");
                setStatusFilter("All");
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Employees Table */}
      {filteredEmployees.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No employees found"
            description="No staff members match the selected filter criteria."
            actionText="+ Add Employee"
            onAction={() => setAddModalOpen(true)}
          />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name & Role</th>
                <th>Email</th>
                <th>Department</th>
                <th>Manager</th>
                <th>Joining Date</th>
                <th>Leave Balance</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => {
                const empBalances = balances.filter((b) => b.employeeId === emp.id);
                const remainingDays = empBalances.reduce((acc, b) => acc + (b.remaining || 0), 0);

                return (
                  <tr key={emp.id}>
                    <td>
                      <span style={{ fontWeight: "700", color: "var(--primary)", fontSize: "13px" }}>
                        {emp.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        <div>
                          <strong>{emp.name}</strong>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {emp.position || emp.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {emp.email}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          background: "var(--background)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {emp.department}
                      </span>
                    </td>
                    <td style={{ fontSize: "13px" }}>{emp.manager || "—"}</td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {emp.joiningDate}
                    </td>
                    <td>
                      <strong style={{ color: "var(--primary)", fontSize: "14px" }}>
                        {remainingDays}
                      </strong>{" "}
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>days left</span>
                    </td>
                    <td>
                      <span className={`badge ${emp.status === "Active" ? "badge-active" : "badge-inactive"}`}>
                        <span className="badge-dot" />
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => setViewingEmployee(emp)}
                          title="View Employee Profile"
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit3}
                          onClick={() => setEditingEmployee({ ...emp })}
                          title="Edit Employee"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Key}
                          onClick={() => {
                            setResetModalEmp(emp);
                            setTempPassword("123");
                            setResetComplete(false);
                            setCopiedPassword(false);
                          }}
                          title="Reset employee password to 123"
                          style={{ color: "#2563EB" }}
                        >
                          Reset Pass
                        </Button>
                        {emp.id === "ADM001" || emp.role === "Administrator" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Shield}
                            disabled
                            title="Administrator account is protected and cannot be deactivated"
                            style={{ color: "#64748B", opacity: 0.7, cursor: "not-allowed" }}
                          >
                            Protected
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Power}
                            onClick={() => handleToggleStatus(emp)}
                            title={emp.status === "Active" ? "Deactivate employee" : "Activate employee"}
                            style={{ color: emp.status === "Active" ? "var(--warning)" : "var(--success)" }}
                          >
                            {emp.status === "Active" ? "Deactivate" : "Activate"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="+ Add New Employee"
        maxWidth="640px"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddSubmit}>
              Create Employee Record
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input
                type="text"
                className="form-control"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Maya Patel"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="maya@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-control"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reporting Manager</label>
              <select
                className="form-control"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              >
                {managers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-control"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Job Title / Position</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. UX Designer"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Joining Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Corporate Credentials Policy Info */}
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "12px 14px",
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
                color: "#1E40AF",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginTop: "4px",
              }}
            >
              <div style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                <Key size={14} /> Corporate Account Credentials Policy
              </div>
              <div>
                &bull; <strong>Username:</strong> Derived from email ID prefix (<code>{formData.email ? (formData.email.includes("@") ? formData.email.split("@")[0] : formData.email) : "username"}</code>).
              </div>
              <div>
                &bull; <strong>Default Initial Password:</strong> <code>123</code>
              </div>
              <div style={{ fontSize: "11px", color: "#2563EB" }}>
                &bull; The employee will have the option to customize this password upon their first login or keep 123.
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <Modal
          isOpen={!!editingEmployee}
          onClose={() => setEditingEmployee(null)}
          title={`Edit Employee — ${editingEmployee.id}`}
          maxWidth="640px"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditingEmployee(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleEditSubmit}>
                Save Changes
              </Button>
            </>
          }
        >
          <form onSubmit={handleEditSubmit}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "12px 16px",
                background: "var(--background)",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                marginBottom: "16px",
              }}
            >
              <ProfilePictureUploader
                size={70}
                showChangeButton={true}
                targetUser={editingEmployee}
                onAvatarUpdated={(newAvatar) =>
                  setEditingEmployee((prev) => ({ ...prev, avatar: newAvatar }))
                }
              />
              <div>
                <strong style={{ fontSize: "13px", display: "block" }}>Employee Profile Photo</strong>
                <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                  Upload a custom photo or choose a curated business avatar.
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={editingEmployee.email}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={editingEmployee.phone || ""}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-control"
                  value={editingEmployee.department}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reporting Manager</label>
                <select
                  className="form-control"
                  value={editingEmployee.manager}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, manager: e.target.value })}
                >
                  {managers.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-control"
                  value={editingEmployee.role}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                {editingEmployee.id === "ADM001" || editingEmployee.role === "Administrator" ? (
                  <input
                    type="text"
                    className="form-control"
                    value="Active (Protected Administrator)"
                    disabled
                    style={{ background: "#F1F5F9", color: "#0F766E", fontWeight: "600", cursor: "not-allowed" }}
                  />
                ) : (
                  <select
                    className="form-control"
                    value={editingEmployee.status}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                )}
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* View Employee Profile & Balances Modal */}
      {viewingEmployee && (
        <Modal
          isOpen={!!viewingEmployee}
          onClose={() => setViewingEmployee(null)}
          title={`Employee Record — ${viewingEmployee.name}`}
          maxWidth="600px"
          footer={
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <Button
                variant="outline"
                size="sm"
                icon={Key}
                onClick={() => {
                  const emp = viewingEmployee;
                  setViewingEmployee(null);
                  setResetModalEmp(emp);
                  setTempPassword("123");
                  setResetComplete(false);
                  setCopiedPassword(false);
                }}
                style={{ color: "#2563EB" }}
              >
                Reset Password
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setViewingEmployee(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", padding: "16px", background: "var(--background)", borderRadius: "var(--radius-md)" }}>
              <ProfilePictureUploader
                size={68}
                showChangeButton={false}
                targetUser={viewingEmployee}
                onAvatarUpdated={(newAvatar) => {
                  setViewingEmployee((prev) => ({ ...prev, avatar: newAvatar }));
                  dispatch(editEmployee({ id: viewingEmployee.id, avatar: newAvatar }));
                }}
              />
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: "800" }}>{viewingEmployee.name}</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {viewingEmployee.position || viewingEmployee.role} &bull; {viewingEmployee.department}
                </p>
                <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                  <span className={`badge ${viewingEmployee.status === "Active" ? "badge-active" : "badge-inactive"}`}>
                    {viewingEmployee.status}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>ID: {viewingEmployee.id}</span>
                  <span style={{ fontSize: "12px", color: "var(--primary)" }}>Email: {viewingEmployee.email}</span>
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>Leave Balances Quota</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {balances.filter((b) => b.employeeId === viewingEmployee.id).map((b) => (
                <div
                  key={b.leaveType}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "var(--background)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ fontWeight: "600" }}>{b.leaveType}</span>
                  <span>
                    Used: <strong>{b.used}</strong> / Entitled: {b.entitlement} &bull;{" "}
                    <strong style={{ color: "var(--primary)" }}>{b.remaining} remaining</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Reset Password Modal */}
      {resetModalEmp && (
        <Modal
          isOpen={!!resetModalEmp}
          onClose={() => setResetModalEmp(null)}
          title={`Reset Password — ${resetModalEmp.name}`}
          maxWidth="480px"
          footer={
            !resetComplete ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => setResetModalEmp(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Key}
                  onClick={handleResetPasswordSubmit}
                  loading={isResetting}
                >
                  Reset Password
                </Button>
              </>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setResetModalEmp(null)}>
                Done
              </Button>
            )
          }
        >
          {!resetComplete ? (
            <div>
              <div
                style={{
                  padding: "12px",
                  background: "#FEF3C7",
                  border: "1px solid #FDE68A",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#92400E",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <Key size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong>Admin Password Override:</strong> Resetting will overwrite this employee's current password.
                  They will be forced to configure their own private password upon their next login.
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)" }}>Employee Email (Username)</label>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)", marginTop: "2px" }}>
                    {resetModalEmp.email}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="form-label">Temporary Password</label>
                    <button
                      type="button"
                      onClick={() => setTempPassword(`Welcome@${Math.floor(100 + Math.random() * 900)}`)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Sparkles size={13} /> Randomize
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                    Default standard: <code>123</code>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: "8px 0" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#ECFDF5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <CheckCircle2 size={28} />
              </div>
              <h4 style={{ textAlign: "center", fontSize: "16px", fontWeight: "800", color: "var(--text-main)" }}>
                Password Reset Successfully!
              </h4>
              <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", marginBottom: "16px" }}>
                Provide these login credentials to <strong>{resetModalEmp.name}</strong>.
              </p>

              <div
                style={{
                  padding: "14px",
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <strong>Default Username:</strong> <code>{resetModalEmp.username || (resetModalEmp.email?.includes("@") ? resetModalEmp.email.split("@")[0] : resetModalEmp.email)}</code>
                </div>
                <div>
                  <strong>Work Email:</strong> <code>{resetModalEmp.email}</code>
                </div>
                <div>
                  <strong>Password:</strong> <code>{tempPassword}</code>
                </div>
                <div style={{ fontSize: "11px", color: "var(--primary)", marginTop: "4px" }}>
                  Status: <strong>Password Change Offered on Next Login (Optional)</strong>
                </div>
              </div>

              <Button
                variant={copiedPassword ? "success" : "outline"}
                size="md"
                icon={copiedPassword ? Check : Copy}
                onClick={handleCopyCredentials}
                style={{ width: "100%", marginTop: "14px" }}
              >
                {copiedPassword ? "Copied to Clipboard!" : "Copy Login Credentials"}
              </Button>
            </div>
          )}
        </Modal>
      )}
    </DashboardLayout>
  );
}
