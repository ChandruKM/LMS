// API Client connecting Next.js Frontend with the Express Backend (http://localhost:5000/api)

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP error! status: ${res.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`[Backend API] Request to ${url} failed:`, err.message);
    throw err;
  }
}

export const apiClient = {
  baseUrl: API_BASE_URL,

  // Health check
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  // Auth
  auth: {
    login: (username, password, role) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password, role }),
      }),
    changePassword: (employeeId, newPassword) =>
      request("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ employeeId, newPassword }),
      }),
    skipPasswordChange: (employeeId) =>
      request("/auth/skip-password-change", {
        method: "POST",
        body: JSON.stringify({ employeeId }),
      }),
    getUser: (id) => request(`/auth/user/${id}`),
  },

  // Employees
  employees: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/employees${query ? `?${query}` : ""}`);
    },
    getById: (id) => request(`/employees/${id}`),
    create: (data) =>
      request("/employees", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/employees/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    resetPassword: (id, password) =>
      request(`/employees/${id}/reset-password`, {
        method: "POST",
        body: JSON.stringify(password ? { password } : {}),
      }),
    toggleStatus: (id) =>
      request(`/employees/${id}/status`, {
        method: "PATCH",
      }),
  },

  // Leaves
  leaves: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/leaves${query ? `?${query}` : ""}`);
    },
    getById: (id) => request(`/leaves/${id}`),
    apply: (data) =>
      request("/leaves", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/leaves/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    approve: (id, managerRemark) =>
      request(`/leaves/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ managerRemark }),
      }),
    reject: (id, managerRemark) =>
      request(`/leaves/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ managerRemark }),
      }),
    cancel: (id) =>
      request(`/leaves/${id}/cancel`, {
        method: "PATCH",
      }),
  },

  // Balances
  balances: {
    get: (employeeId) =>
      request(`/balances${employeeId ? `?employeeId=${employeeId}` : ""}`),
    adjust: (data) =>
      request("/balances/adjust", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getAdjustments: (employeeId) =>
      request(
        `/balances/adjustments${employeeId ? `?employeeId=${employeeId}` : ""}`
      ),
  },

  // Policies
  policies: {
    getAll: () => request("/policies"),
    create: (data) =>
      request("/policies", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/policies/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    toggle: (id) =>
      request(`/policies/${id}/toggle`, {
        method: "PATCH",
      }),
  },

  // Stats & Notifications
  stats: {
    getSummary: () => request("/stats/summary"),
    getNotifications: (userId) =>
      request(`/stats/notifications${userId ? `?userId=${userId}` : ""}`),
    markNotificationRead: (id) =>
      request(`/stats/notifications/${id}/read`, {
        method: "PATCH",
      }),
    clearNotifications: (userId) =>
      request("/stats/notifications/clear", {
        method: "POST",
        body: JSON.stringify({ userId }),
      }),
  },
};

export default apiClient;
