"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import {
  addPolicy,
  updatePolicy,
  togglePolicyStatus,
  deletePolicy,
} from "../../../redux/slices/policySlice";
import { useToast } from "../../providers";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import EmptyState from "../../../components/common/EmptyState";
import {
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  Power,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function AdminPoliciesPage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { policies } = useSelector((state) => state.policies);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [deletingPolicy, setDeletingPolicy] = useState(null);

  // New policy template
  const [newPolicyData, setNewPolicyData] = useState({
    name: "",
    code: "",
    entitlement: 10,
    color: "#2563EB",
    description: "",
    monthlyAccrual: 0.83,
    carryForward: false,
    maxCarryForward: 0,
    encashment: false,
    probationAllowed: true,
    minDays: 1,
    maxDays: 5,
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newPolicyData.name.trim()) {
      addToast("Policy name is required.", "error");
      return;
    }

    dispatch(
      addPolicy({
        ...newPolicyData,
        entitlement: Number(newPolicyData.entitlement),
        monthlyAccrual: Number(newPolicyData.monthlyAccrual),
        maxCarryForward: Number(newPolicyData.maxCarryForward),
        minDays: Number(newPolicyData.minDays),
        maxDays: Number(newPolicyData.maxDays),
      })
    );

    addToast(`Policy '${newPolicyData.name}' created successfully.`, "success");
    setAddModalOpen(false);
    setNewPolicyData({
      name: "",
      code: "",
      entitlement: 10,
      color: "#2563EB",
      description: "",
      monthlyAccrual: 0.83,
      carryForward: false,
      maxCarryForward: 0,
      encashment: false,
      probationAllowed: true,
      minDays: 1,
      maxDays: 5,
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    dispatch(
      updatePolicy({
        ...editingPolicy,
        entitlement: Number(editingPolicy.entitlement),
        monthlyAccrual: Number(editingPolicy.monthlyAccrual),
        maxCarryForward: Number(editingPolicy.maxCarryForward),
        minDays: Number(editingPolicy.minDays),
        maxDays: Number(editingPolicy.maxDays),
      })
    );

    addToast(`Leave policy '${editingPolicy.name}' updated successfully.`, "success");
    setEditingPolicy(null);
  };

  const handleToggle = (policy) => {
    dispatch(togglePolicyStatus(policy.id));
    const nextState = !policy.enabled ? "Enabled" : "Disabled";
    addToast(`${policy.name} is now ${nextState}.`, "info");
  };

  const handleDeleteConfirm = () => {
    if (deletingPolicy) {
      dispatch(deletePolicy(deletingPolicy.id));
      addToast(`Policy '${deletingPolicy.name}' deleted.`, "info");
      setDeletingPolicy(null);
    }
  };

  return (
    <DashboardLayout requiredRole="Administrator">
      {/* Page Header */}
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
            <ShieldCheck size={24} color="var(--primary)" /> Leave Policy & Entitlement Rules
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Configure annual day allocations, accrual rates, encashment, carry-forward caps, and probation policies.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddModalOpen(true)}>
          + Add Leave Policy
        </Button>
      </div>

      {/* Policies Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        {policies.map((p) => (
          <div
            key={p.id}
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderTop: `4px solid ${p.color || "var(--primary)"}`,
              opacity: p.enabled ? 1 : 0.65,
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: p.color || "var(--primary)",
                      }}
                    />
                    <h3 style={{ fontSize: "17px", fontWeight: "700" }}>{p.name}</h3>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "20px" }}>
                    Policy Code: {p.code || p.id}
                  </span>
                </div>

                <span className={`badge ${p.enabled ? "badge-active" : "badge-inactive"}`}>
                  {p.enabled ? "Active" : "Disabled"}
                </span>
              </div>

              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "18px" }}>
                {p.description || "General organizational leave entitlement."}
              </p>

              {/* Policy Rules Grid (Section 21) */}
              <div
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  fontSize: "12px",
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Annual Entitlement:</span>
                  <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--primary)" }}>
                    {p.entitlement} Days
                  </div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)" }}>Monthly Accrual:</span>
                  <div style={{ fontWeight: "600", color: "var(--text-main)" }}>
                    {p.monthlyAccrual || 0} days/mo
                  </div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)" }}>Carry Forward:</span>
                  <div style={{ fontWeight: "600", color: p.carryForward ? "var(--success)" : "var(--text-secondary)" }}>
                    {p.carryForward ? `Yes (Max ${p.maxCarryForward}d)` : "No"}
                  </div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)" }}>Encashment:</span>
                  <div style={{ fontWeight: "600", color: p.encashment ? "var(--success)" : "var(--text-secondary)" }}>
                    {p.encashment ? "Permitted" : "Not Allowed"}
                  </div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)" }}>Probation Period:</span>
                  <div style={{ fontWeight: "600", color: p.probationAllowed ? "var(--success)" : "var(--warning)" }}>
                    {p.probationAllowed ? "Eligible" : "Blocked"}
                  </div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)" }}>Duration Limit:</span>
                  <div style={{ fontWeight: "600", color: "var(--text-main)" }}>
                    {p.minDays || 1}d to {p.maxDays || 10}d
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
              <Button
                variant="ghost"
                size="sm"
                icon={Power}
                onClick={() => handleToggle(p)}
                style={{ color: p.enabled ? "var(--warning)" : "var(--success)" }}
              >
                {p.enabled ? "Disable" : "Enable"}
              </Button>

              <div style={{ display: "flex", gap: "6px" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Edit3}
                  onClick={() => setEditingPolicy({ ...p })}
                >
                  Configure
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => setDeletingPolicy(p)}
                  style={{ color: "var(--danger)" }}
                  title="Delete Policy"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Policy Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="+ Create New Leave Policy"
        maxWidth="640px"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddSubmit}>
              Create Policy
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">
                Leave Policy Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Sabbatical Leave"
                value={newPolicyData.name}
                onChange={(e) => setNewPolicyData({ ...newPolicyData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. SAB"
                value={newPolicyData.code}
                onChange={(e) => setNewPolicyData({ ...newPolicyData, code: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Annual Entitlement (Days)</label>
              <input
                type="number"
                className="form-control"
                value={newPolicyData.entitlement}
                onChange={(e) => setNewPolicyData({ ...newPolicyData, entitlement: e.target.value })}
                required
                min={0}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Accrual</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={newPolicyData.monthlyAccrual}
                onChange={(e) => setNewPolicyData({ ...newPolicyData, monthlyAccrual: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Theme Color</label>
              <input
                type="color"
                className="form-control"
                style={{ padding: "4px", height: "42px" }}
                value={newPolicyData.color}
                onChange={(e) => setNewPolicyData({ ...newPolicyData, color: e.target.value })}
              />
            </div>
          </div>

          {/* Section 21 Rules Toggles */}
          <div
            style={{
              padding: "16px",
              background: "var(--background)",
              borderRadius: "var(--radius-md)",
              marginBottom: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <h4 style={{ fontSize: "13px", fontWeight: "700" }}>Policy Rules Configuration</h4>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: "13px" }}>Carry Forward to Next Year</strong>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                  Allow unused quota to roll over into the next fiscal cycle
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={newPolicyData.carryForward}
                  onChange={(e) => setNewPolicyData({ ...newPolicyData, carryForward: e.target.checked })}
                />
                <span className="slider" />
              </label>
            </div>

            {newPolicyData.carryForward && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Maximum Carry Forward Days</label>
                <input
                  type="number"
                  className="form-control"
                  value={newPolicyData.maxCarryForward}
                  onChange={(e) => setNewPolicyData({ ...newPolicyData, maxCarryForward: e.target.value })}
                />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: "13px" }}>Leave Encashment</strong>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                  Allow unutilized leave days to be converted to monetary cash
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={newPolicyData.encashment}
                  onChange={(e) => setNewPolicyData({ ...newPolicyData, encashment: e.target.checked })}
                />
                <span className="slider" />
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: "13px" }}>Probation Period Allowed</strong>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                  Permit new employees under probation to claim this leave
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={newPolicyData.probationAllowed}
                  onChange={(e) => setNewPolicyData({ ...newPolicyData, probationAllowed: e.target.checked })}
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Min Consecutive Days</label>
              <input
                type="number"
                className="form-control"
                value={newPolicyData.minDays}
                onChange={(e) => setNewPolicyData({ ...newPolicyData, minDays: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Consecutive Days</label>
              <input
                type="number"
                className="form-control"
                value={newPolicyData.maxDays}
                onChange={(e) => setNewPolicyData({ ...newPolicyData, maxDays: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Policy Guidelines</label>
            <textarea
              className="form-control"
              rows={2}
              value={newPolicyData.description}
              onChange={(e) => setNewPolicyData({ ...newPolicyData, description: e.target.value })}
              placeholder="Instructions for staff applying for this leave..."
            />
          </div>
        </form>
      </Modal>

      {/* Edit Policy Modal */}
      {editingPolicy && (
        <Modal
          isOpen={!!editingPolicy}
          onClose={() => setEditingPolicy(null)}
          title={`Configure Policy — ${editingPolicy.name}`}
          maxWidth="640px"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditingPolicy(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleEditSubmit}>
                Save Policy Rules
              </Button>
            </>
          }
        >
          <form onSubmit={handleEditSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Policy Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingPolicy.name}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Entitlement (Days)</label>
                <input
                  type="number"
                  className="form-control"
                  value={editingPolicy.entitlement}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, entitlement: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Section 21 Rules Config */}
            <div
              style={{
                padding: "16px",
                background: "var(--background)",
                borderRadius: "var(--radius-md)",
                marginBottom: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <h4 style={{ fontSize: "13px", fontWeight: "700" }}>Rules & Restrictions</h4>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "13px" }}>Carry Forward</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    Roll over unused days
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={editingPolicy.carryForward}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, carryForward: e.target.checked })}
                  />
                  <span className="slider" />
                </label>
              </div>

              {editingPolicy.carryForward && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Max Carry Forward Days</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingPolicy.maxCarryForward || 0}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, maxCarryForward: e.target.value })}
                  />
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "13px" }}>Encashment</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    Permit salary payout for unused quota
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={editingPolicy.encashment}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, encashment: e.target.checked })}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "13px" }}>Probation Period Access</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    Eligible during initial 90 days
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={editingPolicy.probationAllowed}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, probationAllowed: e.target.checked })}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Minimum Leave Days</label>
                <input
                  type="number"
                  className="form-control"
                  value={editingPolicy.minDays || 1}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, minDays: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Maximum Leave Days per Application</label>
                <input
                  type="number"
                  className="form-control"
                  value={editingPolicy.maxDays || 10}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, maxDays: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Policy Guidelines</label>
              <textarea
                className="form-control"
                rows={2}
                value={editingPolicy.description || ""}
                onChange={(e) => setEditingPolicy({ ...editingPolicy, description: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPolicy && (
        <Modal
          isOpen={!!deletingPolicy}
          onClose={() => setDeletingPolicy(null)}
          title="Delete Leave Policy"
          maxWidth="460px"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setDeletingPolicy(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
                Delete Policy
              </Button>
            </>
          }
        >
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <AlertTriangle size={32} color="var(--danger)" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: "700" }}>
                Delete {deletingPolicy.name}?
              </h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Are you sure you want to remove this leave policy? Staff will no longer be able to submit applications under this category.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
