# ApexTech — Enterprise Leave Management System

A modern, responsive, enterprise-grade **Leave Management System (LMS)** built with **Next.js (App Router)**, **React**, **Redux Toolkit**, **Spring Boot (REST API)**, and **MySQL** database persistence.

---

## 🌟 Project Overview

**ApexTech LMS** manages the entire corporate employee absence lifecycle:

$$\text{Employee} \longrightarrow \text{Apply Leave} \longrightarrow \text{Manager Review} \longrightarrow \text{Approve/Reject} \longrightarrow \text{Notification} \longrightarrow \text{Balance Update} \longrightarrow \text{History \& Analytics}$$

### 🔐 Three Dedicated Role Portals:
1. **Employee Portal**: Leave balance tracking, instant day calculation, leave submission, pending modification, cancellation, personal calendar, and notifications.
2. **Manager / Supervisor Portal**: Team oversight, pending request approvals with balance deduction, rejection with remarks, team availability calendar, and team absence analytics.
3. **Administrator Portal**: Executive metrics, employee directory (+Add, Edit, Soft-delete), leave policy rule configuration (accrual, carry-forward, encashment, probation), manual quota adjustments with audit log, organization-wide calendar, and master reports.

---

## 🚀 Quick Start Guide

### 1. Installation & Running Locally
The application and backend are configured and ready:

```bash
# 1. Start the Java Spring Boot Backend Server (Port 8080)
npm run backend:dev

# 2. In another terminal, start the Next.js Frontend (Port 3000)
npm run dev
```

Open your browser at:
**[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Demo Login Credentials

For quick evaluation during project demonstrations and viva examinations, you can use the **One-Click Role Switcher Pills** in the Topbar, or log in with the following credentials:

| Role | Username / Email | Password | Destination Dashboard |
| :--- | :--- | :--- | :--- |
| **Employee** | `emp` or `john@example.com` | `123` | `/employee/dashboard` |
| **Manager** | `mgr` or `robert@example.com` | `123` | `/manager/dashboard` |
| **Administrator** | `admin` or `admin@example.com` | `123` | `/admin/dashboard` |

> [!TIP]
> **Convenient Testing:** In the application topbar, click the **Employee**, **Manager**, or **Admin** pills at any time to instantly switch personas without having to log out!

---

## 🛠️ Technology Stack
 
* **Backend:** Java 21 LTS, Spring Boot 4 / 3.4, Spring Data JPA (Hibernate), Maven Wrapper
* **Database:** MySQL 8.0 (`lms_db` on `localhost:3306`)
* **Frontend Framework:** [Next.js](https://nextjs.org/) (App Router with nested layouts and route protection)
* **Frontend Library:** [React](https://react.dev/), [Redux Toolkit](https://redux-toolkit.js.org/), [Recharts](https://recharts.org/), [Lucide React](https://lucide.dev/)
* **State Management & Storage:** Redux Toolkit + live REST API client (`lib/apiClient.js`)
* **Styling:** Modern Vanilla CSS with CSS Custom Properties / Tokens (`app/globals.css`), glassmorphic cards, fluid typography with Google Font Inter, and responsive breakpoints.
 
---
 
## 📂 Architectural Structure
 
```text
LMS/
├── backend/                       # Dedicated Java Spring Boot Backend (Port 8080)
│   ├── mvnw & mvnw.cmd            # Maven Wrapper
│   ├── pom.xml                    # Spring Boot dependencies (JPA, Web, MySQL, Validation)
│   └── src/
│       ├── main/
│       │   ├── java/com/lms/backend/
│       │   │   ├── config/        # CorsConfig, DataInitializer (seeds MySQL tables)
│       │   │   ├── controller/    # Auth, Employee, Leave, Balance, Policy, Stats, Query
│       │   │   ├── model/         # JPA Entities: Employee, Policy, LeaveRequest, etc.
│       │   │   ├── repository/    # Spring Data JPA Repositories
│       │   │   └── dto/           # Request/Response Data Transfer Objects
│       │   └── resources/
│       │       └── application.properties # MySQL connection (root:tiger) & server.port=8080
│       └── test/                  # Spring Boot context & integration tests
│
├── app/                           # Next.js Frontend (Port 3000)
│   ├── globals.css                # Design system variables, tokens, badges, modals, tables
│   ├── layout.js                  # Root layout importing Inter font and Client Providers
│   ├── providers.js               # Redux Provider and Toast notification context
│   ├── page.js                    # Smart root redirect to role dashboard or login
│   ├── login/page.js              # Multi-role authentication & quick demo selector
│   │
│   ├── employee/
│   │   ├── dashboard/page.js      # Stat cards, upcoming leave banner, quota meters, recent table
│   │   ├── apply-leave/page.js    # Live balance check, auto day calculation, form validation
│   │   ├── history/page.js        # Filterable data table, search, edit/cancel modals, CSV export
│   │   ├── calendar/page.js       # Interactive monthly personal leave calendar
│   │   ├── notifications/page.js  # Read/unread status, direct action links, clear history
│   │   └── profile/page.js        # Profile editing and personal leave quota summary
│   │
│   ├── manager/
│   │   ├── dashboard/page.js      # Team stats, on-leave today banner, pending approval list
│   │   ├── requests/page.js       # Review workflow, approve & deduct balance, reject with remarks
│   │   ├── calendar/page.js       # Team schedule calendar with employee & department filters
│   │   ├── reports/page.js        # Trend area chart, category pie chart, employee bar chart
│   │   ├── notifications/page.js  # Team request alerts
│   │   └── profile/page.js        # Manager profile
│   │
│   └── admin/
│       ├── dashboard/page.js      # 6 org metrics, 4 Recharts charts, recent records
│       ├── employees/page.js      # Employee CRUD, department filters, soft-delete toggle
│       ├── policies/page.js       # Section 20 & 21: policy rules, accrual, carry-forward, encashment
│       ├── balances/page.js       # Section 22: quota overview, manual adjustments & audit log
│       ├── records/page.js        # Section 23: master organization leave records & search
│       ├── calendar/page.js       # Section 24: company-wide leave timeline
│       ├── reports/page.js        # Section 25: executive KPI cards & multi-dimensional charts
│       └── settings/page.js       # Section 26: workdays, weekend config, notification toggles
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx            # Role-specific nav menus, notification counters, collapsible
│   │   ├── Topbar.jsx             # Role switcher, search bar, notification dropdown, user menu
│   │   └── DashboardLayout.jsx    # Guarded layout with hydration checking & role protection
│   │
│   ├── common/
│   │   ├── Button.jsx             # Reusable button with variants, sizes, and loading state
│   │   ├── Modal.jsx              # Accessible modal dialog with backdrop blur
│   │   ├── StatusBadge.jsx        # Badges: Pending (Yellow), Approved (Green), Rejected (Red), Cancelled (Gray)
│   │   ├── SearchBar.jsx          # Search input with clear button
│   │   └── EmptyState.jsx         # Clean empty state with icon and call-to-action
│   │
│   ├── dashboard/
│   │   ├── StatCard.jsx           # Metric summary card with icon, value, and subtext
│   │   └── QuickAction.jsx        # Interactive quick navigation tiles
│   │
│   ├── leave/
│   │   ├── LeaveDetailsModal.jsx  # Detailed leave inspector with dynamic action buttons
│   │   ├── LeaveEditModal.jsx     # Modification form for pending requests
│   │   ├── LeaveRejectModal.jsx   # Manager remarks input modal for rejections
│   │   ├── LeaveCancelModal.jsx   # Safe cancellation confirmation dialog
│   │   └── LeaveCalendar.jsx      # Reusable monthly calendar with event pills and day drawer
│   │
│   └── charts/
│       ├── LeaveTrendChart.jsx    # Recharts AreaChart with smooth gradient fills
│       ├── LeaveTypeChart.jsx     # Recharts Donut / PieChart with category legend
│       ├── DepartmentChart.jsx    # Recharts BarChart comparing approved vs pending leaves
│       └── EmployeeLeaveChart.jsx # Recharts BarChart comparing used vs remaining days
│
└── redux/
    ├── store.js                   # Redux Toolkit store with 6 combined slices
    ├── mockData.js                # Realistic seed datasets for employees, policies, leaves, and balances
    ├── localStorageHelper.js      # SSR-safe LocalStorage get/set/clear utilities
    └── slices/
        ├── authSlice.js           # Current user session, role, login/logout, profile updates
        ├── leaveSlice.js          # Leave application, modification, cancellation, approval, rejection
        ├── employeeSlice.js       # Staff directory, leave balances, balance deductions, adjustment log
        ├── notificationSlice.js   # Notification feed, mark read, mark all read, clear
        ├── policySlice.js         # Leave policy rules, entitlements, carry-forward, encashment
        └── settingsSlice.js       # Organization name, workdays, notification rules
```

---

## 📋 Comprehensive Feature Verification Checklist

| Prompt Section | Feature | Implementation Details |
| :--- | :--- | :--- |
| **Section 4** | Authentication | Login form, demo credentials, role routing, forgot password modal |
| **Section 5** | Common Layout | Role-specific sidebar, responsive collapse, search topbar, notification badge |
| **Section 6** | Employee Dashboard | 4 stat cards, upcoming leave banner, category progress meters, recent table |
| **Section 7** | Apply Leave | Dynamic balance check, automatic day calculation, validation, mock document |
| **Section 8** | Leave History | Data table with status badges (Yellow, Green, Red, Gray), search, filters, CSV export |
| **Section 9** | Leave Details | Modal showing request details, reason, attached file, manager remarks |
| **Section 10** | Leave Modification | Modifies pending requests only; updates existing request without duplicates |
| **Section 11** | Leave Cancellation | Confirmation modal; sets status to Cancelled; preserves history |
| **Section 12** | Employee Calendar | Interactive monthly calendar with leave status pill indicators |
| **Section 13** | Notifications | Filter unread/all, mark as read, mark all read, direct link to leave |
| **Section 14** | Manager Dashboard | 4 team stats, on-leave today banner, pending requests review table |
| **Section 15** | Manager Approvals | Approve reduces balance; Reject requires reason; notifications sent |
| **Section 16** | Team Calendar | Team availability calendar with employee & department filters |
| **Section 17** | Manager Reports | Trend area chart, category pie chart, employee bar chart, team quota table |
| **Section 18** | Admin Dashboard | 6 org KPIs, 4 Recharts charts, recent organizational submissions |
| **Section 19** | Employees | +Add Employee modal, Edit modal, Active/Inactive soft-delete toggle |
| **Section 20 & 21** | Leave Policies | Policy rules: entitlement, accrual, carry-forward toggle & max, encashment, probation |
| **Section 22** | Leave Balances | Balance audit table, manual adjustment modal (+/- days), adjustment history log |
| **Section 23** | Leave Records | Master table of all employee leave applications with multi-filter |
| **Section 24** | Admin Calendar | Organization-wide master calendar with department/employee filters |
| **Section 25** | Reports & Analytics | 6 summary cards, 4 visual charts, CSV report export demonstration |
| **Section 26** | Settings | Workdays checkboxes, weekend config, notification preferences, admin credentials |
| **Section 27-29** | Redux & Storage | 6 Redux slices, SSR-safe LocalStorage sync, data persistence on refresh |

---

## 💡 Viva / Project Presentation Q&A

**Q1: How is data persisted without a backend database?**
> State is managed globally via Redux Toolkit and continuously synchronized with the browser's `LocalStorage`. When the application initializes, custom SSR-safe hydration helpers read from `LocalStorage` or seed default mock data if empty.

**Q2: What happens when a manager approves a leave request?**
> A Redux action `approveLeave` updates the status to `"Approved"` and attaches manager remarks. Concurrently, `deductBalance` decrements the employee's remaining quota for that specific leave category, and `addNotification` dispatches a real-time notification to the employee.

**Q3: Can employees modify or cancel approved leaves?**
> No. Per requirements, modification and cancellation are strictly restricted to requests in `"Pending"` status. Once approved or rejected by a manager, the request is finalized.

**Q4: How does the system handle weekends and working days?**
> Under `/admin/settings`, administrators can configure which days of the week are official working days. Unchecked days are flagged as non-working days.

---

## 🏆 Project Completion Status
* **Compilation Status:** `next build` executed with 0 errors (all 24 routes statically optimized).
* **Port:** Live on `http://localhost:3000`.
