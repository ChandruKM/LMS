// Initial Mock Data for Leave Management System

export const INITIAL_POLICIES = [
  {
    id: "POL001",
    name: "Casual Leave",
    code: "CL",
    entitlement: 12,
    color: "#2563EB",
    description: "For personal emergencies, casual events and short unforeseen tasks.",
    enabled: true,
    monthlyAccrual: 1,
    carryForward: true,
    maxCarryForward: 5,
    encashment: false,
    probationAllowed: true,
    minDays: 0.5,
    maxDays: 3,
  },
  {
    id: "POL002",
    name: "Sick Leave",
    code: "SL",
    entitlement: 10,
    color: "#EF4444",
    description: "For medical appointments, illness, and recuperation with medical proof.",
    enabled: true,
    monthlyAccrual: 0.83,
    carryForward: false,
    maxCarryForward: 0,
    encashment: false,
    probationAllowed: true,
    minDays: 1,
    maxDays: 7,
  },
  {
    id: "POL003",
    name: "Vacation Leave",
    code: "VL",
    entitlement: 15,
    color: "#10B981",
    description: "Annual planned vacation, family holidays and rest.",
    enabled: true,
    monthlyAccrual: 1.25,
    carryForward: true,
    maxCarryForward: 7,
    encashment: true,
    probationAllowed: false,
    minDays: 2,
    maxDays: 10,
  },
  {
    id: "POL004",
    name: "Personal Leave",
    code: "PL",
    entitlement: 5,
    color: "#8B5CF6",
    description: "For personal matters and family responsibilities.",
    enabled: true,
    monthlyAccrual: 0.41,
    carryForward: false,
    maxCarryForward: 0,
    encashment: false,
    probationAllowed: true,
    minDays: 1,
    maxDays: 3,
  },
  {
    id: "POL005",
    name: "Maternity Leave",
    code: "ML",
    entitlement: 180,
    color: "#EC4899",
    description: "Extended paid leave for female employees for maternity care.",
    enabled: true,
    monthlyAccrual: 0,
    carryForward: false,
    maxCarryForward: 0,
    encashment: false,
    probationAllowed: true,
    minDays: 30,
    maxDays: 180,
  },
  {
    id: "POL006",
    name: "Paternity Leave",
    code: "PTL",
    entitlement: 15,
    color: "#06B6D4",
    description: "Paid leave for fathers welcoming a newborn child or adoption.",
    enabled: true,
    monthlyAccrual: 0,
    carryForward: false,
    maxCarryForward: 0,
    encashment: false,
    probationAllowed: true,
    minDays: 1,
    maxDays: 15,
  },
];

export const INITIAL_EMPLOYEES = [
  {
    id: "ADM001",
    name: "Admin User",
    email: "admin@example.com",
    username: "admin",
    password: "123",
    mustChangePassword: false,
    phone: "+1 (555) 890-1234",
    department: "Administration",
    manager: "Board",
    managerId: null,
    role: "Administrator",
    position: "Chief People Officer & HR Admin",
    joiningDate: "2019-01-01",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  },
];

export const INITIAL_BALANCES = [];

// Completely fresh leave requests history - starts empty for real user leave applications
export const INITIAL_LEAVES = [];


export const INITIAL_NOTIFICATIONS = [];

export const INITIAL_SETTINGS = {
  organizationName: "ApexTech Inc.",
  companyEmail: "hr@apextech.com",
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  weekendDays: ["Saturday", "Sunday"],
  dailyWorkHours: 8,
  fiscalYearStart: "January",
  notifications: {
    emailAlerts: true,
    approvalNotification: true,
    rejectionNotification: true,
    upcomingLeaveReminder: true,
    reminderDaysBefore: 1,
  },
};

export const INITIAL_BALANCE_ADJUSTMENTS = [];

