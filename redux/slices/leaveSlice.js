import { createSlice } from "@reduxjs/toolkit";
import { INITIAL_LEAVES } from "../mockData";
import { loadState, saveState } from "../localStorageHelper";

const initialLeaves = loadState("leaves", INITIAL_LEAVES);

const initialState = {
  leaves: initialLeaves,
  selectedLeave: null,
  filterStatus: "All",
  filterType: "All",
  filterDepartment: "All",
  searchTerm: "",
};

const leaveSlice = createSlice({
  name: "leaves",
  initialState,
  reducers: {
    setLeaves: (state, action) => {
      state.leaves = action.payload || [];
      saveState("leaves", state.leaves);
    },
    addLeave: (state, action) => {
      // payload contains: employeeId, employeeName, department, managerId, managerName, leaveType, startDate, endDate, days, reason, documentName
      const idNumber = state.leaves.length + 1;
      const newLeave = {
        id: `LV${idNumber.toString().padStart(3, "0")}`,
        appliedDate: new Date().toISOString().slice(0, 10),
        status: "Pending",
        managerRemark: "",
        documentName: action.payload.documentName || "",
        ...action.payload,
      };
      state.leaves.unshift(newLeave);
      saveState("leaves", state.leaves);
    },
    editLeave: (state, action) => {
      // Employees can modify only Pending requests
      const { id, leaveType, startDate, endDate, days, reason, documentName } = action.payload;
      const index = state.leaves.findIndex((l) => l.id === id);
      if (index !== -1 && state.leaves[index].status === "Pending") {
        state.leaves[index] = {
          ...state.leaves[index],
          leaveType,
          startDate,
          endDate,
          days,
          reason,
          documentName: documentName !== undefined ? documentName : state.leaves[index].documentName,
        };
        saveState("leaves", state.leaves);
      }
    },
    cancelLeave: (state, action) => {
      const leaveId = action.payload;
      const index = state.leaves.findIndex((l) => l.id === leaveId);
      if (index !== -1 && state.leaves[index].status === "Pending") {
        state.leaves[index].status = "Cancelled";
        saveState("leaves", state.leaves);
      }
    },
    approveLeave: (state, action) => {
      const { id, managerRemark } = action.payload;
      const index = state.leaves.findIndex((l) => l.id === id);
      if (index !== -1) {
        state.leaves[index].status = "Approved";
        if (managerRemark) {
          state.leaves[index].managerRemark = managerRemark;
        }
        saveState("leaves", state.leaves);
      }
    },
    rejectLeave: (state, action) => {
      const { id, managerRemark } = action.payload;
      const index = state.leaves.findIndex((l) => l.id === id);
      if (index !== -1) {
        state.leaves[index].status = "Rejected";
        state.leaves[index].managerRemark = managerRemark || "Request declined by manager.";
        saveState("leaves", state.leaves);
      }
    },
    setSelectedLeave: (state, action) => {
      state.selectedLeave = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
    setFilterDepartment: (state, action) => {
      state.filterDepartment = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    resetLeavesState: (state) => {
      state.leaves = INITIAL_LEAVES;
      saveState("leaves", INITIAL_LEAVES);
    },
  },
});

export const {
  setLeaves,
  addLeave,
  editLeave,
  cancelLeave,
  approveLeave,
  rejectLeave,
  setSelectedLeave,
  setFilterStatus,
  setFilterType,
  setFilterDepartment,
  setSearchTerm,
  resetLeavesState,
} = leaveSlice.actions;

export default leaveSlice.reducer;
