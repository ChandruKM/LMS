// Safe LocalStorage Helper for Next.js

const isClient = typeof window !== "undefined";

// Clean persistent login to force credentials on site visit
if (isClient) {
  try {
    localStorage.removeItem("lms_currentUser");
    const version = localStorage.getItem("lms_version_flag");
    if (version !== "v5_pwd_123") {
      localStorage.removeItem("lms_employees");
      localStorage.removeItem("lms_leaves");
      localStorage.removeItem("lms_notifications");
      localStorage.removeItem("lms_adjustments");
      localStorage.removeItem("lms_leaveBalances");
      localStorage.setItem("lms_version_flag", "v5_pwd_123");
    }
  } catch (e) {
    // Ignore storage errors
  }
}


export const loadState = (key, fallback) => {
  if (!isClient) return fallback;
  try {
    const serialized = localStorage.getItem(`lms_${key}`);
    if (serialized === null) {
      return fallback;
    }
    return JSON.parse(serialized);
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};


export const saveState = (key, value) => {
  if (!isClient) return;
  try {
    localStorage.setItem(`lms_${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error saving ${key} to localStorage:`, err);
  }
};

export const removeState = (key) => {
  if (!isClient) return;
  try {
    localStorage.removeItem(`lms_${key}`);
  } catch (err) {
    console.warn(`Error removing ${key} from localStorage:`, err);
  }
};

export const clearAllLmsStorage = () => {
  if (!isClient) return;
  const keys = [
    "currentUser",
    "leaves",
    "employees",
    "leaveBalances",
    "notifications",
    "leavePolicies",
    "settings",
    "adjustments",
  ];
  keys.forEach((k) => localStorage.removeItem(`lms_${k}`));
};
