package com.lms.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "balance_adjustments")
public class BalanceAdjustment {

    @Id
    @Column(length = 50, nullable = false)
    private String id;

    @Column(name = "employee_id", nullable = false)
    private String employeeId;

    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "leave_type", nullable = false)
    private String leaveType;

    @Column(name = "previous_balance", nullable = false)
    private Double previousBalance;

    @Column(nullable = false)
    private Double adjustment;

    @Column(name = "new_balance", nullable = false)
    private Double newBalance;

    @Column(length = 500)
    private String reason;

    @Column(name = "adjusted_by")
    private String adjustedBy;

    @Column(nullable = false)
    private String date;

    public BalanceAdjustment() {
    }

    public BalanceAdjustment(String id, String employeeId, String employeeName, String leaveType,
                             Double previousBalance, Double adjustment, Double newBalance,
                             String reason, String adjustedBy, String date) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.leaveType = leaveType;
        this.previousBalance = previousBalance;
        this.adjustment = adjustment;
        this.newBalance = newBalance;
        this.reason = reason;
        this.adjustedBy = adjustedBy;
        this.date = date;
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

    public String getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
    }

    public Double getPreviousBalance() {
        return previousBalance;
    }

    public void setPreviousBalance(Double previousBalance) {
        this.previousBalance = previousBalance;
    }

    public Double getAdjustment() {
        return adjustment;
    }

    public void setAdjustment(Double adjustment) {
        this.adjustment = adjustment;
    }

    public Double getNewBalance() {
        return newBalance;
    }

    public void setNewBalance(Double newBalance) {
        this.newBalance = newBalance;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getAdjustedBy() {
        return adjustedBy;
    }

    public void setAdjustedBy(String adjustedBy) {
        this.adjustedBy = adjustedBy;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}
