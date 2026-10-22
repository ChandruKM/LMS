import { createSlice } from "@reduxjs/toolkit";
import { INITIAL_SETTINGS } from "../mockData";
import { loadState, saveState } from "../localStorageHelper";

const initialSettings = loadState("settings", INITIAL_SETTINGS);

const initialState = {
  settings: initialSettings,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
      saveState("settings", state.settings);
    },
    updateNotificationConfig: (state, action) => {
      state.settings.notifications = {
        ...state.settings.notifications,
        ...action.payload,
      };
      saveState("settings", state.settings);
    },
    resetSettingsState: (state) => {
      state.settings = INITIAL_SETTINGS;
      saveState("settings", INITIAL_SETTINGS);
    },
  },
});

export const { updateSettings, updateNotificationConfig, resetSettingsState } = settingsSlice.actions;
export default settingsSlice.reducer;
