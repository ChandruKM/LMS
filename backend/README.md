# LMS Spring Boot Backend & MySQL Database

Enterprise backend service for the Leave Management System (LMS) built with **Java 21**, **Spring Boot 4 / 3.4**, **Spring Data JPA (Hibernate)**, and **MySQL 8.0**.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Java 21 LTS** (`java -version` & `javac -version`)
* **MySQL Server 8.0** running on `localhost:3306`

### 1. Database Setup
The backend automatically connects to MySQL on port `3306` and creates the `lms_db` schema if it doesn't already exist.
* **Database Name**: `lms_db`
* **Username**: `root`
* **Password**: `tiger`

Credentials can be customized in `backend/src/main/resources/application.properties`.

### 2. Run Backend
From the root folder:
```powershell
npm run backend:dev
```
Or directly from the `backend/` folder using the included Maven Wrapper:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Once running, the backend will be available at:
👉 **`http://localhost:8080/api`**

### 3. Verify Health Check
Open your browser or run:
```powershell
curl.exe http://localhost:8080/api/health
```
Output:
```json
{
  "database": "MySQL",
  "service": "Spring Boot LMS Backend",
  "status": "UP"
}
```

---

## 📂 Project Architecture

```text
backend/
├── mvnw & mvnw.cmd              # Maven Wrapper (no global Maven installation required)
├── pom.xml                      # Project dependencies & build config
└── src/
    ├── main/
    │   ├── java/com/lms/backend/
    │   │   ├── BackendApplication.java     # Spring Boot application entrypoint
    │   │   ├── config/
    │   │   │   ├── CorsConfig.java         # CORS configuration for Next.js (port 3000)
    │   │   │   └── DataInitializer.java    # Seeds initial employees, policies, & balances
    │   │   ├── controller/
    │   │   │   ├── HealthController.java   # /api/health
    │   │   │   ├── AuthController.java     # /api/auth/login & /api/auth/user/{id}
    │   │   │   ├── EmployeeController.java # CRUD for /api/employees
    │   │   │   ├── PolicyController.java   # CRUD for /api/policies
    │   │   │   ├── BalanceController.java  # /api/balances & /api/balances/adjust
    │   │   │   ├── LeaveController.java    # /api/leaves (apply, approve, reject, cancel)
    │   │   │   ├── StatsController.java    # /api/stats/summary & notifications
    │   │   │   └── DatabaseQueryController.java # /api/db/query for Admin SQL Console
    │   │   ├── dto/
    │   │   │   ├── LoginRequest.java
    │   │   │   ├── BalanceAdjustmentRequest.java
    │   │   │   ├── LeaveActionRequest.java
    │   │   │   └── ApiResponse.java
    │   │   ├── model/
    │   │   │   ├── Employee.java           # JPA Entity -> table `employees`
    │   │   │   ├── Policy.java             # JPA Entity -> table `policies`
    │   │   │   ├── LeaveBalance.java       # JPA Entity -> table `leave_balances`
    │   │   │   ├── LeaveRequest.java       # JPA Entity -> table `leave_requests`
    │   │   │   ├── Notification.java       # JPA Entity -> table `notifications`
    │   │   │   └── BalanceAdjustment.java  # JPA Entity -> table `balance_adjustments`
    │   │   └── repository/
    │   │       ├── EmployeeRepository.java
    │   │       ├── PolicyRepository.java
    │   │       ├── LeaveBalanceRepository.java
    │   │       ├── LeaveRequestRepository.java
    │   │       ├── NotificationRepository.java
    │   │       └── BalanceAdjustmentRepository.java
    │   └── resources/
    │       └── application.properties       # Server port, MySQL datasource, JPA configs
    └── test/
        └── java/com/lms/backend/
            └── BackendApplicationTests.java # Context and connection integration test
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and database connectivity |
| `POST` | `/api/auth/login` | Authenticate user (`username`/`password`/`role`) |
| `GET` | `/api/auth/user/{id}` | Get employee profile by ID |
| `GET` | `/api/employees` | List employees (filters: `department`, `role`, `search`) |
| `GET` | `/api/employees/{id}` | Get employee by ID |
| `POST` | `/api/employees` | Add employee & auto-initialize leave quotas |
| `PUT` | `/api/employees/{id}` | Update employee profile |
| `PATCH` | `/api/employees/{id}/status`| Toggle active/inactive employee status |
| `GET` | `/api/policies` | List all leave policies (Casual, Sick, Vacation, etc.) |
| `POST` | `/api/policies` | Create a new leave policy rule |
| `PUT` | `/api/policies/{id}` | Update leave policy rule |
| `PATCH` | `/api/policies/{id}/toggle` | Enable / disable leave policy |
| `GET` | `/api/balances?employeeId=` | Get leave quota balances & adjustment history |
| `POST` | `/api/balances/adjust` | Manual balance quota adjustment with audit log |
| `GET` | `/api/leaves` | List leave requests (filters: `employeeId`, `managerId`, `status`) |
| `GET` | `/api/leaves/{id}` | Get leave request details |
| `POST` | `/api/leaves` | Submit new leave application |
| `PATCH` | `/api/leaves/{id}/approve` | Approve leave request & deduct employee balance |
| `PATCH` | `/api/leaves/{id}/reject` | Reject leave request with manager remark |
| `PATCH` | `/api/leaves/{id}/cancel` | Cancel pending request / restore approved quota |
| `GET` | `/api/stats/summary` | Executive summary metrics, distributions & trends |
| `GET` | `/api/stats/notifications` | User alerts & system notifications |
| `GET` | `/api/db/query?table=` | Admin SQL Console - browse MySQL tables |
| `POST` | `/api/db/query` | Admin SQL Console - execute SQL queries |
