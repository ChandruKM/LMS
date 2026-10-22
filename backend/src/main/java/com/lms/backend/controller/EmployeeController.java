package com.lms.backend.controller;

import com.lms.backend.model.Employee;
import com.lms.backend.model.LeaveBalance;
import com.lms.backend.model.Policy;
import com.lms.backend.repository.EmployeeRepository;
import com.lms.backend.repository.LeaveBalanceRepository;
import com.lms.backend.repository.PolicyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final PolicyRepository policyRepository;
    private final LeaveBalanceRepository balanceRepository;

    public EmployeeController(EmployeeRepository employeeRepository,
                              PolicyRepository policyRepository,
                              LeaveBalanceRepository balanceRepository) {
        this.employeeRepository = employeeRepository;
        this.policyRepository = policyRepository;
        this.balanceRepository = balanceRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllEmployees(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {

        List<Employee> list = employeeRepository.findAll();

        if (department != null && !department.equalsIgnoreCase("All")) {
            list = list.stream()
                    .filter(e -> department.equalsIgnoreCase(e.getDepartment()))
                    .toList();
        }
        if (role != null && !role.equalsIgnoreCase("All")) {
            list = list.stream()
                    .filter(e -> role.equalsIgnoreCase(e.getRole()))
                    .toList();
        }
        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            list = list.stream()
                    .filter(e -> (e.getName() != null && e.getName().toLowerCase().contains(q)) ||
                                 (e.getEmail() != null && e.getEmail().toLowerCase().contains(q)) ||
                                 (e.getDepartment() != null && e.getDepartment().toLowerCase().contains(q)))
                    .toList();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", list);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getEmployeeById(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        Optional<Employee> emp = employeeRepository.findById(id);
        if (emp.isPresent()) {
            response.put("success", true);
            response.put("data", emp.get());
            return ResponseEntity.ok(response);
        }
        response.put("success", false);
        response.put("error", "Employee not found with id: " + id);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createEmployee(@RequestBody Employee employee) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (employee.getId() == null || employee.getId().trim().isEmpty()) {
                long count = employeeRepository.count();
                employee.setId(String.format("EMP%03d", count + 1));
            }
            if (employee.getEmail() == null || employee.getEmail().trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }
            // Username derived from the email id prefix (before @)
            String email = employee.getEmail().trim().toLowerCase();
            String derivedUsername = email.contains("@") ? email.split("@")[0] : email;
            employee.setUsername(derivedUsername);

            // First default login password is 123
            if (employee.getPassword() == null || employee.getPassword().trim().isEmpty()) {
                employee.setPassword("123");
            }
            // User can optionally change password on first login
            employee.setMustChangePassword(true);
            if (employee.getStatus() == null) {
                employee.setStatus("Active");
            }
            if (employee.getAvatar() == null || employee.getAvatar().trim().isEmpty()) {
                employee.setAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
            }

            Employee saved = employeeRepository.save(employee);

            // Initialize default leave balances for this employee based on active policies
            List<Policy> activePolicies = policyRepository.findByEnabledTrue();
            for (Policy policy : activePolicies) {
                balanceRepository.save(new LeaveBalance(
                        saved.getId(),
                        policy.getName(),
                        policy.getEntitlement(),
                        0.0,
                        policy.getEntitlement()
                ));
            }

            response.put("success", true);
            response.put("message", "Employee created and leave balances initialized");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateEmployee(@PathVariable String id, @RequestBody Employee employee) {
        Map<String, Object> response = new HashMap<>();
        Optional<Employee> existingOpt = employeeRepository.findById(id);

        if (existingOpt.isEmpty()) {
            response.put("success", false);
            response.put("error", "Employee not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Employee existing = existingOpt.get();
        if (employee.getName() != null) existing.setName(employee.getName());
        if (employee.getEmail() != null) {
            String email = employee.getEmail().trim().toLowerCase();
            existing.setEmail(email);
            String derivedUsername = email.contains("@") ? email.split("@")[0] : email;
            existing.setUsername(derivedUsername);
        }
        if (employee.getPassword() != null && !employee.getPassword().trim().isEmpty()) {
            existing.setPassword(employee.getPassword());
        }
        if (employee.getMustChangePassword() != null) {
            existing.setMustChangePassword(employee.getMustChangePassword());
        }
        if (employee.getPhone() != null) existing.setPhone(employee.getPhone());
        if (employee.getDepartment() != null) existing.setDepartment(employee.getDepartment());
        if (employee.getManager() != null) existing.setManager(employee.getManager());
        if (employee.getManagerId() != null) existing.setManagerId(employee.getManagerId());
        if (employee.getRole() != null) existing.setRole(employee.getRole());
        if (employee.getPosition() != null) existing.setPosition(employee.getPosition());
        if (employee.getJoiningDate() != null) existing.setJoiningDate(employee.getJoiningDate());
        if ("ADM001".equalsIgnoreCase(id) || "Administrator".equalsIgnoreCase(existing.getRole())) {
            existing.setStatus("Active");
        } else if (employee.getStatus() != null) {
            existing.setStatus(employee.getStatus());
        }
        if (employee.getAvatar() != null) existing.setAvatar(employee.getAvatar());

        Employee updated = employeeRepository.save(existing);
        response.put("success", true);
        response.put("message", "Employee updated successfully");
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        Optional<Employee> empOpt = employeeRepository.findById(id);

        if (empOpt.isEmpty()) {
            response.put("success", false);
            response.put("error", "Employee not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Employee employee = empOpt.get();
        String tempPassword = (payload != null && payload.containsKey("password") && payload.get("password") != null && !payload.get("password").trim().isEmpty())
                ? payload.get("password").trim()
                : "123";

        employee.setPassword(tempPassword);
        employee.setMustChangePassword(true);
        Employee updated = employeeRepository.save(employee);

        response.put("success", true);
        response.put("message", "Password reset successfully for " + updated.getName());
        response.put("temporaryPassword", tempPassword);
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> toggleStatus(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        Optional<Employee> empOpt = employeeRepository.findById(id);

        if (empOpt.isEmpty()) {
            response.put("success", false);
            response.put("error", "Employee not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Employee emp = empOpt.get();
        if ("ADM001".equalsIgnoreCase(emp.getId()) || "Administrator".equalsIgnoreCase(emp.getRole())) {
            response.put("success", false);
            response.put("error", "Administrator account is protected and cannot be deactivated");
            return ResponseEntity.badRequest().body(response);
        }

        emp.setStatus("Active".equalsIgnoreCase(emp.getStatus()) ? "Inactive" : "Active");
        employeeRepository.save(emp);

        response.put("success", true);
        response.put("message", "Employee status changed to " + emp.getStatus());
        response.put("data", emp);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteEmployee(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        if ("ADM001".equalsIgnoreCase(id)) {
            response.put("success", false);
            response.put("error", "Administrator account cannot be deleted");
            return ResponseEntity.badRequest().body(response);
        }
        if (!employeeRepository.existsById(id)) {
            response.put("success", false);
            response.put("error", "Employee not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        balanceRepository.findByEmployeeId(id).forEach(balanceRepository::delete);
        employeeRepository.deleteById(id);
        response.put("success", true);
        response.put("message", "Employee deleted successfully");
        return ResponseEntity.ok(response);
    }
}
