package com.lms.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String username;

    private String password;

    private String phone;

    private String department;

    private String manager;

    @Column(name = "manager_id")
    private String managerId;

    @Column(nullable = false)
    private String role; // "Employee", "Manager", "Administrator"

    private String position;

    @Column(name = "joining_date")
    private String joiningDate;

    @Column(nullable = false)
    private String status; // "Active", "Inactive"

    @Column(columnDefinition = "LONGTEXT")
    private String avatar;

    @Column(name = "must_change_password")
    private Boolean mustChangePassword = false;

    public Employee() {
    }

    public Employee(String id, String name, String email, String username, String password,
                    String phone, String department, String manager, String managerId,
                    String role, String position, String joiningDate, String status, String avatar) {
        this(id, name, email, username, password, phone, department, manager, managerId, role, position, joiningDate, status, avatar, false);
    }

    public Employee(String id, String name, String email, String username, String password,
                    String phone, String department, String manager, String managerId,
                    String role, String position, String joiningDate, String status, String avatar,
                    Boolean mustChangePassword) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.username = username;
        this.password = password;
        this.phone = phone;
        this.department = department;
        this.manager = manager;
        this.managerId = managerId;
        this.role = role;
        this.position = position;
        this.joiningDate = joiningDate;
        this.status = status;
        this.avatar = avatar;
        this.mustChangePassword = mustChangePassword != null ? mustChangePassword : false;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getManager() {
        return manager;
    }

    public void setManager(String manager) {
        this.manager = manager;
    }

    public String getManagerId() {
        return managerId;
    }

    public void setManagerId(String managerId) {
        this.managerId = managerId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(String joiningDate) {
        this.joiningDate = joiningDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Boolean getMustChangePassword() {
        return mustChangePassword;
    }

    public void setMustChangePassword(Boolean mustChangePassword) {
        this.mustChangePassword = mustChangePassword;
    }
}
