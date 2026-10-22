package com.lms.backend.controller;

import com.lms.backend.model.Notification;
import com.lms.backend.repository.EmployeeRepository;
import com.lms.backend.repository.LeaveRequestRepository;
import com.lms.backend.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRepository;
    private final NotificationRepository notificationRepository;

    public StatsController(EmployeeRepository employeeRepository,
                           LeaveRequestRepository leaveRepository,
                           NotificationRepository notificationRepository) {
        this.employeeRepository = employeeRepository;
        this.leaveRepository = leaveRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        long totalEmployees = employeeRepository.count();
        long totalRequests = leaveRepository.count();
        long pendingRequests = leaveRepository.countByStatus("Pending");
        long approvedRequests = leaveRepository.countByStatus("Approved");
        long rejectedRequests = leaveRepository.countByStatus("Rejected");
        long cancelledRequests = leaveRepository.countByStatus("Cancelled");

        Double totalDaysTaken = leaveRepository.sumApprovedDays();
        if (totalDaysTaken == null) totalDaysTaken = 0.0;

        List<Object[]> rawTypeDist = leaveRepository.findLeaveTypeDistribution();
        List<Map<String, Object>> typeDistribution = new ArrayList<>();
        for (Object[] row : rawTypeDist) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0]);
            map.put("value", row[1]);
            typeDistribution.add(map);
        }

        List<Object[]> rawDeptUsage = leaveRepository.findDepartmentUsage();
        List<Map<String, Object>> departmentUsage = new ArrayList<>();
        for (Object[] row : rawDeptUsage) {
            Map<String, Object> map = new HashMap<>();
            map.put("department", row[0] != null ? row[0] : "General");
            map.put("approved", row[1]);
            map.put("pending", row[2]);
            departmentUsage.add(map);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmployees", totalEmployees);
        stats.put("totalRequests", totalRequests);
        stats.put("pendingRequests", pendingRequests);
        stats.put("approvedRequests", approvedRequests);
        stats.put("rejectedRequests", rejectedRequests);
        stats.put("cancelledRequests", cancelledRequests);
        stats.put("totalDaysTaken", totalDaysTaken);
        stats.put("typeDistribution", typeDistribution);
        stats.put("departmentUsage", departmentUsage);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("stats", stats);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/notifications")
    public ResponseEntity<Map<String, Object>> getNotifications(@RequestParam(required = false) String userId) {
        List<Notification> list;
        if (userId != null && !userId.trim().isEmpty()) {
            list = notificationRepository.findByUserIdOrderByTimestampDesc(userId.trim());
        } else {
            list = notificationRepository.findAllByOrderByTimestampDesc();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", list);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<Map<String, Object>> markNotificationRead(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        Optional<Notification> opt = notificationRepository.findById(id);

        if (opt.isEmpty()) {
            response.put("success", false);
            response.put("error", "Notification not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Notification notif = opt.get();
        notif.setIsRead(true);
        notificationRepository.save(notif);

        response.put("success", true);
        response.put("message", "Notification marked as read");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/notifications/clear")
    @Transactional
    public ResponseEntity<Map<String, Object>> clearNotifications(@RequestBody(required = false) Map<String, String> body) {
        String userId = (body != null && body.containsKey("userId")) ? body.get("userId") : null;
        if (userId != null && !userId.trim().isEmpty()) {
            notificationRepository.deleteByUserId(userId.trim());
        } else {
            notificationRepository.deleteAll();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notifications cleared");
        return ResponseEntity.ok(response);
    }
}
