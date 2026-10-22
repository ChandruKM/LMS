package com.lms.backend.controller;

import com.lms.backend.dto.BalanceAdjustmentRequest;
import com.lms.backend.model.BalanceAdjustment;
import com.lms.backend.model.Employee;
import com.lms.backend.model.LeaveBalance;
import com.lms.backend.repository.BalanceAdjustmentRepository;
import com.lms.backend.repository.EmployeeRepository;
import com.lms.backend.repository.LeaveBalanceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/balances")
public class BalanceController {

    private final LeaveBalanceRepository balanceRepository;
    private final BalanceAdjustmentRepository adjustmentRepository;
    private final EmployeeRepository employeeRepository;

    public BalanceController(LeaveBalanceRepository balanceRepository,
                             BalanceAdjustmentRepository adjustmentRepository,
                             EmployeeRepository employeeRepository) {
        this.balanceRepository = balanceRepository;
        this.adjustmentRepository = adjustmentRepository;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getBalances(@RequestParam(required = false) String employeeId) {
        Map<String, Object> response = new HashMap<>();
        List<LeaveBalance> balances;

        if (employeeId != null && !employeeId.trim().isEmpty()) {
            balances = balanceRepository.findByEmployeeId(employeeId.trim());
        } else {
            balances = balanceRepository.findAll();
        }

        List<BalanceAdjustment> adjustments;
        if (employeeId != null && !employeeId.trim().isEmpty()) {
            adjustments = adjustmentRepository.findByEmployeeIdOrderByDateDesc(employeeId.trim());
        } else {
            adjustments = adjustmentRepository.findAllByOrderByDateDesc();
        }

        response.put("success", true);
        response.put("data", Map.of(
                "balances", balances,
                "adjustments", adjustments
        ));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/adjustments")
    public ResponseEntity<Map<String, Object>> getAdjustments(@RequestParam(required = false) String employeeId) {
        Map<String, Object> response = new HashMap<>();
        List<BalanceAdjustment> adjustments;

        if (employeeId != null && !employeeId.trim().isEmpty()) {
            adjustments = adjustmentRepository.findByEmployeeIdOrderByDateDesc(employeeId.trim());
        } else {
            adjustments = adjustmentRepository.findAllByOrderByDateDesc();
        }

        response.put("success", true);
        response.put("data", adjustments);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/adjust")
    public ResponseEntity<Map<String, Object>> adjustBalance(@RequestBody BalanceAdjustmentRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (request.getEmployeeId() == null || request.getLeaveType() == null || request.getAdjustment() == null) {
            response.put("success", false);
            response.put("error", "employeeId, leaveType, and adjustment are required");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<LeaveBalance> balanceOpt = balanceRepository.findByEmployeeIdAndLeaveType(
                request.getEmployeeId(), request.getLeaveType());

        if (balanceOpt.isEmpty()) {
            response.put("success", false);
            response.put("error", "Leave balance record not found for employee " + request.getEmployeeId() + " and leave type " + request.getLeaveType());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        LeaveBalance balance = balanceOpt.get();
        double prevBalance = balance.getRemaining();
        double newRemaining = Math.max(0, balance.getRemaining() + request.getAdjustment());
        double newEntitlement = Math.max(0, balance.getEntitlement() + request.getAdjustment());

        balance.setEntitlement(newEntitlement);
        balance.setRemaining(newRemaining);
        balanceRepository.save(balance);

        // Fetch employee name if not provided
        String employeeName = request.getEmployeeName();
        if (employeeName == null || employeeName.trim().isEmpty()) {
            Optional<Employee> empOpt = employeeRepository.findById(request.getEmployeeId());
            employeeName = empOpt.map(Employee::getName).orElse(request.getEmployeeId());
        }

        // Record adjustment
        String adjId = "ADJ" + System.currentTimeMillis() % 100000;
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

        BalanceAdjustment adjustment = new BalanceAdjustment(
                adjId,
                request.getEmployeeId(),
                employeeName,
                request.getLeaveType(),
                prevBalance,
                request.getAdjustment(),
                newRemaining,
                request.getReason() != null ? request.getReason() : "Manual quota adjustment",
                request.getAdjustedBy() != null ? request.getAdjustedBy() : "Admin",
                dateStr
        );
        adjustmentRepository.save(adjustment);

        response.put("success", true);
        response.put("message", "Balance adjusted successfully");
        response.put("data", Map.of(
                "newBalance", newRemaining,
                "adjustment", adjustment
        ));
        return ResponseEntity.ok(response);
    }
}
