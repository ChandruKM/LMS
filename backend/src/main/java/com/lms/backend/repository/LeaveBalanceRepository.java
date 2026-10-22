package com.lms.backend.repository;

import com.lms.backend.model.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    List<LeaveBalance> findByEmployeeId(String employeeId);
    Optional<LeaveBalance> findByEmployeeIdAndLeaveType(String employeeId, String leaveType);
    void deleteByEmployeeId(String employeeId);
}
