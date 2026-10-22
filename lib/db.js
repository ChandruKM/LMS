import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import {
  INITIAL_POLICIES,
  INITIAL_EMPLOYEES,
  INITIAL_BALANCES,
  INITIAL_LEAVES,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  INITIAL_BALANCE_ADJUSTMENTS,
} from "../redux/mockData";

const dbDir = path.join(process.cwd(), "database");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "lms.db");
const db = new DatabaseSync(dbPath);

// Initialize tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      username TEXT NOT NULL,
      phone TEXT,
      department TEXT,
      manager TEXT,
      manager_id TEXT,
      role TEXT NOT NULL,
      position TEXT,
      joining_date TEXT,
      status TEXT NOT NULL,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS policies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      entitlement REAL NOT NULL,
      color TEXT,
      description TEXT,
      enabled INTEGER DEFAULT 1,
      monthly_accrual REAL,
      carry_forward INTEGER DEFAULT 0,
      max_carry_forward REAL DEFAULT 0,
      encashment INTEGER DEFAULT 0,
      probation_allowed INTEGER DEFAULT 1,
      min_days REAL DEFAULT 1,
      max_days REAL DEFAULT 10
    );

    CREATE TABLE IF NOT EXISTS leave_balances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT NOT NULL,
      leave_type TEXT NOT NULL,
      entitlement REAL NOT NULL,
      used REAL DEFAULT 0,
      remaining REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      department TEXT,
      manager_id TEXT,
      manager_name TEXT,
      leave_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      days REAL NOT NULL,
      reason TEXT,
      document_name TEXT,
      status TEXT NOT NULL,
      applied_date TEXT NOT NULL,
      manager_remark TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      timestamp TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      link TEXT
    );

    CREATE TABLE IF NOT EXISTS balance_adjustments (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      employee_name TEXT,
      leave_type TEXT NOT NULL,
      previous_balance REAL NOT NULL,
      adjustment REAL NOT NULL,
      new_balance REAL NOT NULL,
      reason TEXT,
      adjusted_by TEXT,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed default data if empty
  const countRow = db.prepare("SELECT COUNT(*) AS count FROM employees").get();
  if (countRow.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  // Employees
  const insertEmp = db.prepare(`
    INSERT INTO employees (id, name, email, username, phone, department, manager, manager_id, role, position, joining_date, status, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const e of INITIAL_EMPLOYEES) {
    insertEmp.run(e.id, e.name, e.email, e.username, e.phone, e.department, e.manager, e.managerId, e.role, e.position, e.joiningDate, e.status, e.avatar);
  }

  // Policies
  const insertPol = db.prepare(`
    INSERT INTO policies (id, name, code, entitlement, color, description, enabled, monthly_accrual, carry_forward, max_carry_forward, encashment, probation_allowed, min_days, max_days)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of INITIAL_POLICIES) {
    insertPol.run(
      p.id, p.name, p.code, p.entitlement, p.color, p.description,
      p.enabled ? 1 : 0, p.monthlyAccrual, p.carryForward ? 1 : 0,
      p.maxCarryForward, p.encashment ? 1 : 0, p.probationAllowed ? 1 : 0,
      p.minDays, p.maxDays
    );
  }

  // Balances
  const insertBal = db.prepare(`
    INSERT INTO leave_balances (employee_id, leave_type, entitlement, used, remaining)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const b of INITIAL_BALANCES) {
    insertBal.run(b.employeeId, b.leaveType, b.entitlement, b.used, b.remaining);
  }

  // Leave Requests
  const insertReq = db.prepare(`
    INSERT INTO leave_requests (id, employee_id, employee_name, department, manager_id, manager_name, leave_type, start_date, end_date, days, reason, document_name, status, applied_date, manager_remark)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const r of INITIAL_LEAVES) {
    insertReq.run(
      r.id, r.employeeId, r.employeeName, r.department, r.managerId, r.managerName,
      r.leaveType, r.startDate, r.endDate, r.days, r.reason, r.documentName,
      r.status, r.appliedDate, r.managerRemark
    );
  }

  // Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, timestamp, read, link)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const n of INITIAL_NOTIFICATIONS) {
    insertNotif.run(n.id, n.userId, n.title, n.message, n.type, n.timestamp, n.read ? 1 : 0, n.link);
  }

  // Balance Adjustments
  const insertAdj = db.prepare(`
    INSERT INTO balance_adjustments (id, employee_id, employee_name, leave_type, previous_balance, adjustment, new_balance, reason, adjusted_by, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of INITIAL_BALANCE_ADJUSTMENTS) {
    insertAdj.run(a.id, a.employeeId, a.employeeName, a.leaveType, a.previousBalance, a.adjustment, a.newBalance, a.reason, a.adjustedBy, a.date);
  }

  // Settings
  const insertSet = db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`);
  insertSet.run("organization", JSON.stringify(INITIAL_SETTINGS));
}

// Auto-run init
initDatabase();

export default db;
