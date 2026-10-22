import { createSlice } from "@reduxjs/toolkit";
import { INITIAL_EMPLOYEES, INITIAL_BALANCES, INITIAL_BALANCE_ADJUSTMENTS, INITIAL_POLICIES } from "../mockData";
import { loadState, saveState } from "../localStorageHelper";

const initialEmployees = loadState("employees", INITIAL_EMPLOYEES);
const initialBalances = loadState("leaveBalances", INITIAL_BALANCES);
const initialAdjustments = loadState("adjustments", INITIAL_BALANCE_ADJUSTMENTS);

const initialState = {
  employees: initialEmployees,
  balances: initialBalances,
  adjustments: initialAdjustments,
  selectedEmployee: null,
};

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    setEmployees: (state, action) => {
      state.employees = action.payload || [];
      saveState("employees", state.employees);
    },
    setBalances: (state, action) => {
      state.balances = action.payload || [];
      saveState("leaveBalances", state.balances);
    },
    setAdjustments: (state, action) => {
      state.adjustments = action.payload || [];
      saveState("adjustments", state.adjustments);
    },
    addEmployee: (state, action) => {
      const newEmp = action.payload;
      state.employees.unshift(newEmp);
      saveState("employees", state.employees);

      // Initialize default balances for the new employee based on existing policies
      const defaultBalances = INITIAL_POLICIES.map((policy) => ({
        employeeId: newEmp.id,
        leaveType: policy.name,
        entitlement: policy.entitlement,
        used: 0,
        remaining: policy.entitlement,
      }));
      state.balances = [...state.balances, ...defaultBalances];
      saveState("leaveBalances", state.balances);
    },
    editEmployee: (state, action) => {
      const updated = action.payload;
      const index = state.employees.findIndex((e) => e.id === updated.id);
      if (index !== -1) {
        if (state.employees[index].id === "ADM001" || state.employees[index].role === "Administrator") {
          updated.status = "Active";
        }
        state.employees[index] = { ...state.employees[index], ...updated };
        saveState("employees", state.employees);
      }
    },
    toggleEmployeeStatus: (state, action) => {
      const empId = action.payload;
      const emp = state.employees.find((e) => e.id === empId);
      if (emp) {
        if (emp.id === "ADM001" || emp.role === "Administrator") {
          return; // Administrator account cannot be deactivated
        }
        emp.status = emp.status === "Active" ? "Inactive" : "Active";
        saveState("employees", state.employees);
      }
    },
    resetEmployeePassword: (state, action) => {
      const { id, password = "123" } = action.payload;
      const emp = state.employees.find((e) => e.id === id);
      if (emp) {
        emp.password = password;
        emp.mustChangePassword = true;
        saveState("employees", state.employees);
      }
    },
    adjustBalance: (state, action) => {
      const { employeeId, leaveType, adjustment, reason, adjustedBy } = action.payload;
      const balanceRecord = state.balances.find(
        (b) => b.employeeId === employeeId && b.leaveType === leaveType
      );

      const emp = state.employees.find((e) => e.id === employeeId);
      const empName = emp ? emp.name : employeeId;

      if (balanceRecord) {
        const prev = balanceRecord.remaining;
        balanceRecord.remaining = Math.max(0, balanceRecord.remaining + Number(adjustment));
        balanceRecord.entitlement = Math.max(0, balanceRecord.entitlement + Number(adjustment));
        saveState("leaveBalances", state.balances);

        const newAdjRecord = {
          id: `ADJ${Date.now().toString().slice(-4)}`,
          employeeId,
          employeeName: empName,
          leaveType,
          previousBalance: prev,
          adjustment: Number(adjustment),
          newBalance: balanceRecord.remaining,
          reason: reason || "Manual administrative adjustment",
          adjustedBy: adjustedBy || "Admin User",
          date: new Date().toISOString().replace("T", " ").slice(0, 16),
        };

        state.adjustments.unshift(newAdjRecord);
        saveState("adjustments", state.adjustments);
      }
    },
    deductBalance: (state, action) => {
      const { employeeId, leaveType, days } = action.payload;
      const balanceRecord = state.balances.find(
        (b) => b.employeeId === employeeId && b.leaveType === leaveType
      );
      if (balanceRecord) {
        balanceRecord.used += Number(days);
        balanceRecord.remaining = Math.max(0, balanceRecord.remaining - Number(days));
        saveState("leaveBalances", state.balances);
      }
    },
    restoreBalance: (state, action) => {
      // If an approved leave is cancelled or reverted
      const { employeeId, leaveType, days } = action.payload;
      const balanceRecord = state.balances.find(
        (b) => b.employeeId === employeeId && b.leaveType === leaveType
      );
      if (balanceRecord) {
        balanceRecord.used = Math.max(0, balanceRecord.used - Number(days));
        balanceRecord.remaining += Number(days);
        saveState("leaveBalances", state.balances);
      }
    },
    resetEmployeeState: (state) => {
      state.employees = INITIAL_EMPLOYEES;
      state.balances = INITIAL_BALANCES;
      state.adjustments = INITIAL_BALANCE_ADJUSTMENTS;
      saveState("employees", INITIAL_EMPLOYEES);
      saveState("leaveBalances", INITIAL_BALANCES);
      saveState("adjustments", INITIAL_BALANCE_ADJUSTMENTS);
    },
  },
});

export const {
  setEmployees,
  setBalances,
  setAdjustments,
  addEmployee,
  editEmployee,
  toggleEmployeeStatus,
  resetEmployeePassword,
  adjustBalance,
  deductBalance,
  restoreBalance,
  resetEmployeeState,
} = employeeSlice.actions;

export default employeeSlice.reducer;
