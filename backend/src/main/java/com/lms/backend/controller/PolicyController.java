package com.lms.backend.controller;

import com.lms.backend.model.Policy;
import com.lms.backend.repository.PolicyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {

    private final PolicyRepository policyRepository;

    public PolicyController(PolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPolicies() {
        List<Policy> policies = policyRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", policies);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createPolicy(@RequestBody Policy policy) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (policy.getId() == null || policy.getId().trim().isEmpty()) {
                long count = policyRepository.count();
                policy.setId(String.format("POL%03d", count + 1));
            }
            if (policy.getEnabled() == null) {
                policy.setEnabled(true);
            }
            Policy saved = policyRepository.save(policy);
            response.put("success", true);
            response.put("message", "Policy created successfully");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updatePolicy(@PathVariable String id, @RequestBody Policy policy) {
        Map<String, Object> response = new HashMap<>();
        Optional<Policy> existingOpt = policyRepository.findById(id);

        if (existingOpt.isEmpty()) {
            response.put("success", false);
            response.put("error", "Policy not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Policy existing = existingOpt.get();
        if (policy.getName() != null) existing.setName(policy.getName());
        if (policy.getCode() != null) existing.setCode(policy.getCode());
        if (policy.getEntitlement() != null) existing.setEntitlement(policy.getEntitlement());
        if (policy.getColor() != null) existing.setColor(policy.getColor());
        if (policy.getDescription() != null) existing.setDescription(policy.getDescription());
        if (policy.getEnabled() != null) existing.setEnabled(policy.getEnabled());
        if (policy.getMonthlyAccrual() != null) existing.setMonthlyAccrual(policy.getMonthlyAccrual());
        if (policy.getCarryForward() != null) existing.setCarryForward(policy.getCarryForward());
        if (policy.getMaxCarryForward() != null) existing.setMaxCarryForward(policy.getMaxCarryForward());
        if (policy.getEncashment() != null) existing.setEncashment(policy.getEncashment());
        if (policy.getProbationAllowed() != null) existing.setProbationAllowed(policy.getProbationAllowed());
        if (policy.getMinDays() != null) existing.setMinDays(policy.getMinDays());
        if (policy.getMaxDays() != null) existing.setMaxDays(policy.getMaxDays());

        Policy saved = policyRepository.save(existing);
        response.put("success", true);
        response.put("message", "Policy updated successfully");
        response.put("data", saved);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Map<String, Object>> togglePolicy(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        Optional<Policy> policyOpt = policyRepository.findById(id);

        if (policyOpt.isEmpty()) {
            response.put("success", false);
            response.put("error", "Policy not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Policy policy = policyOpt.get();
        policy.setEnabled(!Boolean.TRUE.equals(policy.getEnabled()));
        policyRepository.save(policy);

        response.put("success", true);
        response.put("message", "Policy " + (policy.getEnabled() ? "enabled" : "disabled"));
        response.put("data", policy);
        return ResponseEntity.ok(response);
    }
}
