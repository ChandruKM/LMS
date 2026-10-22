package com.lms.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @Column(length = 50, nullable = false)
    private String id;

    @Column(name = "employee_id", nullable = false)
    private String employeeId;

    @Column(name = "employee_name", nullable = false)
    private String employeeName;

    private String department;

    @Column(name = "manager_id")
    private String managerId;

    @Column(name = "manager_name")
    private String managerName;

    @Column(name = "leave_type", nullable = false)
    private String leaveType;

    @Column(name = "start_date", nullable = false)
    private String startDate;

    @Column(name = "end_date", nullable = false)
    private String endDate;

    @Column(nullable = false)
    private Double days;

    @Column(length = 1000)
    private String reason;

    @Column(name = "document_name")
    private String documentName;

    @Column(nullable = false)
    private String status; // "Pending", "Approved", "Rejected", "Cancelled"

    @Column(name = "applied_date", nullable = false)
    private String appliedDate;

    @Column(name = "manager_remark", length = 1000)
    private String managerRemark;

    public LeaveRequest() {
    }

    public LeaveRequest(String id, String employeeId, String employeeName, String department,
                        String managerId, String managerName, String leaveType, String startDate,
                        String endDate, Double days, String reason, String documentName,
                        String status, String appliedDate, String managerRemark) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.department = department;
        this.managerId = managerId;
        this.managerName = managerName;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.days = days;
        this.reason = reason;
        this.documentName = documentName;
        this.status = status;
        this.appliedDate = appliedDate;
        this.managerRemark = managerRemark;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getManagerId() {
        return managerId;
    }

    public void setManagerId(String managerId) {
        this.managerId = managerId;
    }

    public String getManagerName() {
        return managerName;
    }

    public void setManagerName(String managerName) {
        this.managerName = managerName;
    }

    public String getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public Double getDays() {
        return days;
    }

    public void setDays(Double days) {
        this.days = days;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(String appliedDate) {
        this.appliedDate = appliedDate;
    }

    public String getManagerRemark() {
        return managerRemark;
    }

    public void setManagerRemark(String managerRemark) {
        this.managerRemark = managerRemark;
    }
}
