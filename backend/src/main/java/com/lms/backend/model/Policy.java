package com.lms.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "policies")
public class Policy {

    @Id
    @Column(length = 50, nullable = false)
    private String id;

    @Column(nullable = false)
    private String name;

    private String code;

    @Column(nullable = false)
    private Double entitlement;

    private String color;

    @Column(length = 500)
    private String description;

    private Boolean enabled = true;

    @Column(name = "monthly_accrual")
    private Double monthlyAccrual;

    @Column(name = "carry_forward")
    private Boolean carryForward = false;

    @Column(name = "max_carry_forward")
    private Double maxCarryForward = 0.0;

    private Boolean encashment = false;

    @Column(name = "probation_allowed")
    private Boolean probationAllowed = true;

    @Column(name = "min_days")
    private Double minDays = 1.0;

    @Column(name = "max_days")
    private Double maxDays = 10.0;

    public Policy() {
    }

    public Policy(String id, String name, String code, Double entitlement, String color,
                  String description, Boolean enabled, Double monthlyAccrual, Boolean carryForward,
                  Double maxCarryForward, Boolean encashment, Boolean probationAllowed,
                  Double minDays, Double maxDays) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.entitlement = entitlement;
        this.color = color;
        this.description = description;
        this.enabled = enabled;
        this.monthlyAccrual = monthlyAccrual;
        this.carryForward = carryForward;
        this.maxCarryForward = maxCarryForward;
        this.encashment = encashment;
        this.probationAllowed = probationAllowed;
        this.minDays = minDays;
        this.maxDays = maxDays;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Double getEntitlement() {
        return entitlement;
    }

    public void setEntitlement(Double entitlement) {
        this.entitlement = entitlement;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public Double getMonthlyAccrual() {
        return monthlyAccrual;
    }

    public void setMonthlyAccrual(Double monthlyAccrual) {
        this.monthlyAccrual = monthlyAccrual;
    }

    public Boolean getCarryForward() {
        return carryForward;
    }

    public void setCarryForward(Boolean carryForward) {
        this.carryForward = carryForward;
    }

    public Double getMaxCarryForward() {
        return maxCarryForward;
    }

    public void setMaxCarryForward(Double maxCarryForward) {
        this.maxCarryForward = maxCarryForward;
    }

    public Boolean getEncashment() {
        return encashment;
    }

    public void setEncashment(Boolean encashment) {
        this.encashment = encashment;
    }

    public Boolean getProbationAllowed() {
        return probationAllowed;
    }

    public void setProbationAllowed(Boolean probationAllowed) {
        this.probationAllowed = probationAllowed;
    }

    public Double getMinDays() {
        return minDays;
    }

    public void setMinDays(Double minDays) {
        this.minDays = minDays;
    }

    public Double getMaxDays() {
        return maxDays;
    }

    public void setMaxDays(Double maxDays) {
        this.maxDays = maxDays;
    }
}
