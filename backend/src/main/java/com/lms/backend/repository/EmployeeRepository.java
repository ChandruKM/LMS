package com.lms.backend.repository;

import com.lms.backend.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {
    Optional<Employee> findByEmailIgnoreCase(String email);
    Optional<Employee> findByUsernameIgnoreCase(String username);
    List<Employee> findByDepartmentIgnoreCase(String department);
    List<Employee> findByRoleIgnoreCase(String role);
}
