import { createSlice } from "@reduxjs/toolkit";
import { INITIAL_NOTIFICATIONS } from "../mockData";
import { loadState, saveState } from "../localStorageHelper";

const initialNotifications = loadState("notifications", INITIAL_NOTIFICATIONS);

const initialState = {
  notifications: initialNotifications,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload || [];
      saveState("notifications", state.notifications);
    },
    addNotification: (state, action) => {
      const newNotif = {
        id: `NOT${Date.now().toString().slice(-5)}`,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
        read: false,
        type: "info",
        ...action.payload,
      };
      state.notifications.unshift(newNotif);
      saveState("notifications", state.notifications);
    },
    markAsRead: (state, action) => {
      const id = action.payload;
      const notif = state.notifications.find((n) => n.id === id);
      if (notif) {
        notif.read = true;
        saveState("notifications", state.notifications);
      }
    },
    markAllAsRead: (state, action) => {
      const userId = action.payload;
      state.notifications.forEach((n) => {
        if (!userId || n.userId === userId) {
          n.read = true;
        }
      });
      saveState("notifications", state.notifications);
    },
    clearNotification: (state, action) => {
      const id = action.payload;
      state.notifications = state.notifications.filter((n) => n.id !== id);
      saveState("notifications", state.notifications);
    },
    clearAllNotifications: (state, action) => {
      const userId = action.payload;
      if (userId) {
        state.notifications = state.notifications.filter((n) => n.userId !== userId);
      } else {
        state.notifications = [];
      }
      saveState("notifications", state.notifications);
    },
    resetNotificationState: (state) => {
      state.notifications = INITIAL_NOTIFICATIONS;
      saveState("notifications", INITIAL_NOTIFICATIONS);
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotification,
  clearAllNotifications,
  resetNotificationState,
} = notificationSlice.actions;

export default notificationSlice.reducer;
