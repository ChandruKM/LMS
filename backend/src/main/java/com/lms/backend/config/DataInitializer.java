package com.lms.backend.config;

import com.lms.backend.model.Employee;
import com.lms.backend.model.LeaveBalance;
import com.lms.backend.model.Policy;
import com.lms.backend.repository.EmployeeRepository;
import com.lms.backend.repository.LeaveBalanceRepository;
import com.lms.backend.repository.PolicyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final PolicyRepository policyRepository;
    private final LeaveBalanceRepository balanceRepository;

    public DataInitializer(EmployeeRepository employeeRepository,
                           PolicyRepository policyRepository,
                           LeaveBalanceRepository balanceRepository) {
        this.employeeRepository = employeeRepository;
        this.policyRepository = policyRepository;
        this.balanceRepository = balanceRepository;
    }

    @Override
    public void run(String... args) {
        // Seed Policies if empty
        if (policyRepository.count() == 0) {
            List<Policy> policies = Arrays.asList(
                new Policy("POL001", "Casual Leave", "CL", 12.0, "#2563EB",
                    "For personal emergencies, casual events and short unforeseen tasks.",
                    true, 1.0, true, 5.0, false, true, 0.5, 3.0),
                new Policy("POL002", "Sick Leave", "SL", 10.0, "#EF4444",
                    "For medical appointments, illness, and recuperation with medical proof.",
                    true, 0.83, false, 0.0, false, true, 1.0, 7.0),
                new Policy("POL003", "Vacation Leave", "VL", 15.0, "#10B981",
                    "Annual planned vacation, family holidays and rest.",
                    true, 1.25, true, 7.0, true, false, 2.0, 10.0),
                new Policy("POL004", "Personal Leave", "PL", 5.0, "#8B5CF6",
                    "For personal matters and family responsibilities.",
                    true, 0.41, false, 0.0, false, true, 1.0, 3.0),
                new Policy("POL005", "Maternity Leave", "ML", 180.0, "#EC4899",
                    "Extended paid leave for female employees for maternity care.",
                    true, 0.0, false, 0.0, false, true, 30.0, 180.0),
                new Policy("POL006", "Paternity Leave", "PTL", 15.0, "#06B6D4",
                    "Paid leave for fathers welcoming a newborn child or adoption.",
                    true, 0.0, false, 0.0, false, true, 1.0, 15.0)
            );
            policyRepository.saveAll(policies);
            System.out.println("✅ Seeded initial policies into MySQL database.");
        }

        // Seed Admin User if not exists
        Optional<Employee> adminOpt = employeeRepository.findById("ADM001");
        if (adminOpt.isPresent()) {
            Employee admin = adminOpt.get();
            admin.setUsername("admin");
            if (admin.getPassword() == null || "Welcome@123".equals(admin.getPassword()) || admin.getPassword().trim().isEmpty()) {
                admin.setPassword("123");
            }
            if (admin.getMustChangePassword() == null) {
                admin.setMustChangePassword(false);
            }
            employeeRepository.save(admin);
        } else {
            Employee admin = new Employee("ADM001", "Admin User", "admin@example.com", "admin", "123",
                    "+1 (555) 890-1234", "Administration", "Board", null,
                    "Administrator", "Chief People Officer & HR Admin", "2019-01-01", "Active",
                    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
                    false);
            employeeRepository.save(admin);
            System.out.println("✅ Seeded Admin User (ADM001) into database.");
        }

        // Ensure all existing employees have username as email prefix before @ and default password 123
        List<Employee> allEmployees = employeeRepository.findAll();
        for (Employee emp : allEmployees) {
            boolean changed = false;
            if (emp.getEmail() != null && emp.getEmail().contains("@")) {
                String prefix = emp.getEmail().split("@")[0].trim().toLowerCase();
                if (emp.getUsername() == null || !emp.getUsername().equalsIgnoreCase(prefix)) {
                    emp.setUsername(prefix);
                    changed = true;
                }
            }
            if (emp.getPassword() == null || emp.getPassword().trim().isEmpty() || "Welcome@123".equals(emp.getPassword())) {
                emp.setPassword("123");
                changed = true;
            }
            if (changed) {
                employeeRepository.save(emp);
            }
        }
    }
}
