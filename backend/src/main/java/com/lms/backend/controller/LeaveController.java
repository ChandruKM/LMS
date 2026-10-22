package com.lms.backend.controller;

import com.lms.backend.dto.LeaveActionRequest;
import com.lms.backend.model.LeaveBalance;
import com.lms.backend.model.LeaveRequest;
import com.lms.backend.model.Notification;
import com.lms.backend.repository.LeaveBalanceRepository;
import com.lms.backend.repository.LeaveRequestRepository;
import com.lms.backend.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveRequestRepository leaveRepository;
    private final LeaveBalanceRepository balanceRepository;
    private final NotificationRepository notificationRepository;

    public LeaveController(LeaveRequestRepository leaveRepository,
                           LeaveBalanceRepository balanceRepository,
                           NotificationRepository notificationRepository) {
        this.leaveRepository = leaveRepository;
        this.balanceRepository = balanceRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllLeaves(
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String managerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String leaveType) {

        List<LeaveRequest> list = leaveRepository.findAllByOrderByAppliedDateDescIdDesc();

        if (employeeId != null && !employeeId.trim().isEmpty()) {
            list = list.stream().filter(l -> employeeId.equalsIgnoreCase(l.getEmployeeId())).collect(Collectors.toList());
        }
        if (managerId != null && !managerId.trim().isEmpty()) {
            list = list.stream().filter(l -> managerId.equalsIgnoreCase(l.getManagerId())).collect(Collectors.toList());
        }
        if (status != null && !status.equalsIgnoreCase("All") && !status.trim().isEmpty()) {
            list = list.stream().filter(l -> status.equalsIgnoreCase(l.getStatus())).collect(Collectors.toList());
        }
        if (department != null && !department.equalsIgnoreCase("All") && !department.trim().isEmpty()) {
            list = list.stream().filter(l -> department.equalsIgnoreCase(l.getDepartment())).collect(Collectors.toList());
        }
        if (leaveType != null && !leaveType.equalsIgnoreCase("All") && !leaveType.trim().isEmpty()) {
            list = list.stream().filter(l -> leaveType.equalsIgnoreCase(l.getLeaveType())).collect(Collectors.toList());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", list);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getLeaveById(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        Optional<LeaveRequest> leave = leaveRepository.findById(id);

        if (leave.isPresent()) {
            response.put("success", true);
            response.put("data", leave.get());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", "Leave request not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> applyLeave(@RequestBody LeaveRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (request.getStartDate() == null || request.getEndDate() == null || request.getLeaveType() == null) {
                response.put("success", false);
                response.put("error", "Start date, end date, and leave type are required");
                return ResponseEntity.badRequest().body(response);
            }

            LocalDate today = LocalDate.now();
            LocalDate start = LocalDate.parse(request.getStartDate());
            if (start.isBefore(today)) {
                response.put("success", false);
                response.put("error", "Cannot apply for past dates. Please select today or a future date.");
                return ResponseEntity.badRequest().body(response);
            }

            long totalCount = leaveRepository.count();
            String id = String.format("LV%03d", totalCount + 1);

            request.setId(id);
            request.setStatus("Pending");
            request.setAppliedDate(today.toString());
            request.setManagerRemark("");
            if (request.getDepartment() == null) request.setDepartment("General");
            if (request.getManagerId() == null) request.setManagerId("MGR001");
            if (request.getManagerName() == null) request.setManagerName("Robert Fox");

            LeaveRequest saved = leaveRepository.save(request);

            // Create notification for manager
            String notifId = "NOT" + (System.currentTimeMillis() % 100000);
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            Notification notif = new Notification(
                    notifId,
                    saved.getManagerId(),
                    "New Leave Application",
                    saved.getEmployeeName() + " applied for " + saved.getLeaveType() + " (" + saved.getDays() + " days)",
                    "warning",
                    timestamp,
                    false,
                    "/manager/requests"
            );
            notificationRepository.save(notif);

            response.put("success", true);
            response.put("message", "Leave application submitted successfully");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveLeave(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {

        String remark = (body != null && body.containsKey("managerRemark")) ? body.get("managerRemark") : "Approved by manager.";
        return processApproval(id, remark);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectLeave(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {

        String remark = (body != null && body.containsKey("managerRemark")) ? body.get("managerRemark") : "Declined by manager.";
        return processRejection(id, remark);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelLeave(@PathVariable String id) {
        return processCancellation(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateOrHandleAction(
            @PathVariable String id,
            @RequestBody LeaveActionRequest actionReq) {

        if (actionReq.getAction() != null) {
            String act = actionReq.getAction().toLowerCase();
            if ("approve".equals(act)) {
                return processApproval(id, actionReq.getManagerRemark());
            } else if ("reject".equals(act)) {
                return processRejection(id, actionReq.getManagerRemark());
            } else if ("cancel".equals(act)) {
                return processCancellation(id);
            } else if ("edit".equals(act)) {
                return processEdit(id, actionReq);
            }
        }

        // Standard edit if pending
        return processEdit(id, actionReq);
    }

    private ResponseEntity<Map<String, Object>> processApproval(String id, String remark) {
        Map<String, Object> response = new HashMap<>();
        Optional<LeaveRequest> opt = leaveRepository.findById(id);

        if (opt.isEmpty()) {
            response.put("success", false);
            response.put("error", "Leave request not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        LeaveRequest leave = opt.get();
        leave.setStatus("Approved");
        leave.setManagerRemark(remark != null ? remark : "Approved by manager.");
        leaveRepository.save(leave);

        // Deduct from balance
        Optional<LeaveBalance> balanceOpt = balanceRepository.findByEmployeeIdAndLeaveType(
                leave.getEmployeeId(), leave.getLeaveType());

        if (balanceOpt.isPresent()) {
            LeaveBalance bal = balanceOpt.get();
            bal.setUsed(bal.getUsed() + leave.getDays());
            bal.setRemaining(Math.max(0, bal.getRemaining() - leave.getDays()));
            balanceRepository.save(bal);
        }

        // Notify employee
        String notifId = "NOT" + (System.currentTimeMillis() % 100000);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        Notification notif = new Notification(
                notifId,
                leave.getEmployeeId(),
                "Leave Approved",
                "Your " + leave.getLeaveType() + " request for " + leave.getDays() + " days has been approved.",
                "success",
                timestamp,
                false,
                "/employee/history"
        );
        notificationRepository.save(notif);

        response.put("success", true);
        response.put("message", "Leave approved and balance deducted");
        response.put("data", leave);
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> processRejection(String id, String remark) {
        Map<String, Object> response = new HashMap<>();
        Optional<LeaveRequest> opt = leaveRepository.findById(id);

        if (opt.isEmpty()) {
            response.put("success", false);
            response.put("error", "Leave request not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        LeaveRequest leave = opt.get();
        leave.setStatus("Rejected");
        leave.setManagerRemark(remark != null ? remark : "Declined by manager.");
        leaveRepository.save(leave);

        // Notify employee
        String notifId = "NOT" + (System.currentTimeMillis() % 100000);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        Notification notif = new Notification(
                notifId,
                leave.getEmployeeId(),
                "Leave Rejected",
                "Your " + leave.getLeaveType() + " request was rejected. Remarks: " + leave.getManagerRemark(),
                "danger",
                timestamp,
                false,
                "/employee/history"
        );
        notificationRepository.save(notif);

        response.put("success", true);
        response.put("message", "Leave rejected and employee notified");
        response.put("data", leave);
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> processCancellation(String id) {
        Map<String, Object> response = new HashMap<>();
        Optional<LeaveRequest> opt = leaveRepository.findById(id);

        if (opt.isEmpty()) {
            response.put("success", false);
            response.put("error", "Leave request not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        LeaveRequest leave = opt.get();
        boolean wasApproved = "Approved".equalsIgnoreCase(leave.getStatus());
        leave.setStatus("Cancelled");
        leaveRepository.save(leave);

        // If it was already approved, restore the used & remaining balance
        if (wasApproved) {
            Optional<LeaveBalance> balanceOpt = balanceRepository.findByEmployeeIdAndLeaveType(
                    leave.getEmployeeId(), leave.getLeaveType());
            if (balanceOpt.isPresent()) {
                LeaveBalance bal = balanceOpt.get();
                bal.setUsed(Math.max(0, bal.getUsed() - leave.getDays()));
                bal.setRemaining(bal.getRemaining() + leave.getDays());
                balanceRepository.save(bal);
            }
        }

        response.put("success", true);
        response.put("message", "Leave request marked as cancelled");
        response.put("data", leave);
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> processEdit(String id, LeaveActionRequest req) {
        Map<String, Object> response = new HashMap<>();
        Optional<LeaveRequest> opt = leaveRepository.findById(id);

        if (opt.isEmpty()) {
            response.put("success", false);
            response.put("error", "Leave request not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        LeaveRequest leave = opt.get();
        if (!"Pending".equalsIgnoreCase(leave.getStatus())) {
            response.put("success", false);
            response.put("error", "Only pending requests can be modified");
            return ResponseEntity.badRequest().body(response);
        }

        if (req.getLeaveType() != null) leave.setLeaveType(req.getLeaveType());
        if (req.getStartDate() != null) leave.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) leave.setEndDate(req.getEndDate());
        if (req.getDays() != null) leave.setDays(req.getDays());
        if (req.getReason() != null) leave.setReason(req.getReason());
        if (req.getDocumentName() != null) leave.setDocumentName(req.getDocumentName());

        LeaveRequest updated = leaveRepository.save(leave);
        response.put("success", true);
        response.put("message", "Leave request updated successfully");
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }
}
