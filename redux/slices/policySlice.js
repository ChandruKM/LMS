import { createSlice } from "@reduxjs/toolkit";
import { INITIAL_POLICIES } from "../mockData";
import { loadState, saveState } from "../localStorageHelper";

const initialPolicies = loadState("leavePolicies", INITIAL_POLICIES);

const initialState = {
  policies: initialPolicies,
  selectedPolicy: null,
};

const policySlice = createSlice({
  name: "policies",
  initialState,
  reducers: {
    setPolicies: (state, action) => {
      state.policies = action.payload || [];
      saveState("leavePolicies", state.policies);
    },
    addPolicy: (state, action) => {
      const newPolicy = {
        id: `POL${(state.policies.length + 1).toString().padStart(3, "0")}`,
        enabled: true,
        ...action.payload,
      };
      state.policies.push(newPolicy);
      saveState("leavePolicies", state.policies);
    },
    updatePolicy: (state, action) => {
      const updated = action.payload;
      const index = state.policies.findIndex((p) => p.id === updated.id);
      if (index !== -1) {
        state.policies[index] = { ...state.policies[index], ...updated };
        saveState("leavePolicies", state.policies);
      }
    },
    togglePolicyStatus: (state, action) => {
      const id = action.payload;
      const policy = state.policies.find((p) => p.id === id);
      if (policy) {
        policy.enabled = !policy.enabled;
        saveState("leavePolicies", state.policies);
      }
    },
    deletePolicy: (state, action) => {
      const id = action.payload;
      state.policies = state.policies.filter((p) => p.id !== id);
      saveState("leavePolicies", state.policies);
    },
    setSelectedPolicy: (state, action) => {
      state.selectedPolicy = action.payload;
    },
    resetPolicyState: (state) => {
      state.policies = INITIAL_POLICIES;
      saveState("leavePolicies", INITIAL_POLICIES);
    },
  },
});

export const {
  setPolicies,
  addPolicy,
  updatePolicy,
  togglePolicyStatus,
  deletePolicy,
  setSelectedPolicy,
  resetPolicyState,
} = policySlice.actions;

export default policySlice.reducer;
