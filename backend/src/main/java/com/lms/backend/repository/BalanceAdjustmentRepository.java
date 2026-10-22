package com.lms.backend.repository;

import com.lms.backend.model.BalanceAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BalanceAdjustmentRepository extends JpaRepository<BalanceAdjustment, String> {
    List<BalanceAdjustment> findByEmployeeIdOrderByDateDesc(String employeeId);
    List<BalanceAdjustment> findAllByOrderByDateDesc();
}
