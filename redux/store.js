import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import leaveReducer, { setLeaves } from "./slices/leaveSlice";
import employeeReducer, { setEmployees, setBalances, setAdjustments } from "./slices/employeeSlice";
import notificationReducer, { setNotifications } from "./slices/notificationSlice";
import policyReducer, { setPolicies } from "./slices/policySlice";
import settingsReducer from "./slices/settingsSlice";
import apiClient from "../lib/apiClient";

// Middleware to automatically sync Redux mutations to the Spring Boot / MySQL backend
const backendSyncMiddleware = () => (next) => (action) => {
  const result = next(action);

  if (typeof window === "undefined" || !action.type) {
    return result;
  }

  try {
    switch (action.type) {
      case "leaves/addLeave":
        apiClient.leaves.apply(action.payload).catch((err) =>
          console.warn("[MySQL Sync] addLeave error:", err.message)
        );
        break;

      case "leaves/editLeave":
        if (action.payload?.id) {
          apiClient.leaves.update(action.payload.id, action.payload).catch((err) =>
            console.warn("[MySQL Sync] editLeave error:", err.message)
          );
        }
        break;

      case "leaves/cancelLeave":
        apiClient.leaves.cancel(action.payload).catch((err) =>
          console.warn("[MySQL Sync] cancelLeave error:", err.message)
        );
        break;

      case "leaves/approveLeave":
        apiClient.leaves.approve(action.payload.id, action.payload.managerRemark).catch((err) =>
          console.warn("[MySQL Sync] approveLeave error:", err.message)
        );
        break;

      case "leaves/rejectLeave":
        apiClient.leaves.reject(action.payload.id, action.payload.managerRemark).catch((err) =>
          console.warn("[MySQL Sync] rejectLeave error:", err.message)
        );
        break;

      case "employees/addEmployee":
        apiClient.employees.create(action.payload).catch((err) =>
          console.warn("[MySQL Sync] addEmployee error:", err.message)
        );
        break;

      case "employees/editEmployee":
        if (action.payload?.id) {
          apiClient.employees.update(action.payload.id, action.payload).catch((err) =>
            console.warn("[MySQL Sync] editEmployee error:", err.message)
          );
        }
        break;

      case "employees/toggleEmployeeStatus":
        apiClient.employees.toggleStatus(action.payload).catch((err) =>
          console.warn("[MySQL Sync] toggleEmployeeStatus error:", err.message)
        );
        break;

      case "employees/resetEmployeePassword":
        if (action.payload?.id) {
          apiClient.employees.resetPassword(action.payload.id, action.payload.password).catch((err) =>
            console.warn("[MySQL Sync] resetPassword error:", err.message)
          );
        }
        break;

      case "auth/completePasswordChange":
        // User changed password on first login
        const currentUser = store.getState().auth.user;
        if (currentUser?.id) {
          apiClient.auth.changePassword(currentUser.id, action.payload).catch((err) =>
            console.warn("[MySQL Sync] changePassword error:", err.message)
          );
        }
        break;

      case "employees/adjustBalance":
        apiClient.balances.adjust(action.payload).catch((err) =>
          console.warn("[MySQL Sync] adjustBalance error:", err.message)
        );
        break;

      case "policies/addPolicy":
        apiClient.policies.create(action.payload).catch((err) =>
          console.warn("[MySQL Sync] addPolicy error:", err.message)
        );
        break;

      case "policies/updatePolicy":
        if (action.payload?.id) {
          apiClient.policies.update(action.payload.id, action.payload).catch((err) =>
            console.warn("[MySQL Sync] updatePolicy error:", err.message)
          );
        }
        break;

      case "policies/togglePolicyStatus":
        apiClient.policies.toggle(action.payload).catch((err) =>
          console.warn("[MySQL Sync] togglePolicy error:", err.message)
        );
        break;

      case "notifications/markAsRead":
        apiClient.stats.markNotificationRead(action.payload).catch((err) =>
          console.warn("[MySQL Sync] markAsRead error:", err.message)
        );
        break;

      case "notifications/clearAllNotifications":
        apiClient.stats.clearNotifications(action.payload).catch((err) =>
          console.warn("[MySQL Sync] clearNotifications error:", err.message)
        );
        break;

      default:
        break;
    }
  } catch (err) {
    console.warn("[MySQL Sync Middleware] Exception:", err);
  }

  return result;
};

// Initial sync to pull real MySQL data from Spring Boot into Redux
export async function syncFromBackend(dispatch) {
  try {
    const isOnline = await apiClient.checkHealth();
    if (!isOnline) {
      console.info("[Backend Sync] Spring Boot backend is offline, continuing with local cache.");
      return;
    }

    const [empRes, polRes, leaveRes, balRes, notifRes] = await Promise.allSettled([
      apiClient.employees.getAll(),
      apiClient.policies.getAll(),
      apiClient.leaves.getAll(),
      apiClient.balances.get(),
      apiClient.stats.getNotifications(),
    ]);

    if (empRes.status === "fulfilled" && empRes.value?.data) {
      dispatch(setEmployees(empRes.value.data));
    }
    if (polRes.status === "fulfilled" && polRes.value?.data) {
      dispatch(setPolicies(polRes.value.data));
    }
    if (leaveRes.status === "fulfilled" && leaveRes.value?.data) {
      dispatch(setLeaves(leaveRes.value.data));
    }
    if (balRes.status === "fulfilled" && balRes.value?.data) {
      if (balRes.value.data.balances) {
        dispatch(setBalances(balRes.value.data.balances));
      }
      if (balRes.value.data.adjustments) {
        dispatch(setAdjustments(balRes.value.data.adjustments));
      }
    }
    if (notifRes.status === "fulfilled" && notifRes.value?.data) {
      dispatch(setNotifications(notifRes.value.data));
    }

    console.info("✅ [Backend Sync] Successfully synchronized data from MySQL database.");
  } catch (err) {
    console.warn("[Backend Sync] Synchronization error:", err);
  }
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leaves: leaveReducer,
    employees: employeeReducer,
    notifications: notificationReducer,
    policies: policyReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(backendSyncMiddleware),
});

export default store;
