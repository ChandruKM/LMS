package com.lms.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "leave_balances")
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private String employeeId;

    @Column(name = "leave_type", nullable = false)
    private String leaveType;

    @Column(nullable = false)
    private Double entitlement = 0.0;

    @Column(nullable = false)
    private Double used = 0.0;

    @Column(nullable = false)
    private Double remaining = 0.0;

    public LeaveBalance() {
    }

    public LeaveBalance(String employeeId, String leaveType, Double entitlement, Double used, Double remaining) {
        this.employeeId = employeeId;
        this.leaveType = leaveType;
        this.entitlement = entitlement;
        this.used = used;
        this.remaining = remaining;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
    }

    public Double getEntitlement() {
        return entitlement;
    }

    public void setEntitlement(Double entitlement) {
        this.entitlement = entitlement;
    }

    public Double getUsed() {
        return used;
    }

    public void setUsed(Double used) {
        this.used = used;
    }

    public Double getRemaining() {
        return remaining;
    }

    public void setRemaining(Double remaining) {
        this.remaining = remaining;
    }
}
