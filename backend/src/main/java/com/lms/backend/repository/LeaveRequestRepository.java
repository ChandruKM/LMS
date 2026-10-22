package com.lms.backend.repository;

import com.lms.backend.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, String> {
    List<LeaveRequest> findByEmployeeIdOrderByAppliedDateDesc(String employeeId);
    List<LeaveRequest> findByManagerIdOrderByAppliedDateDesc(String managerId);
    List<LeaveRequest> findByStatusOrderByAppliedDateDesc(String status);
    List<LeaveRequest> findAllByOrderByAppliedDateDescIdDesc();

    long countByStatus(String status);

    @Query("SELECT COALESCE(SUM(l.days), 0) FROM LeaveRequest l WHERE l.status = 'Approved'")
    Double sumApprovedDays();

    @Query("SELECT l.leaveType AS name, COALESCE(SUM(l.days), 0) AS value FROM LeaveRequest l WHERE l.status = 'Approved' GROUP BY l.leaveType")
    List<Object[]> findLeaveTypeDistribution();

    @Query("SELECT l.department, " +
           "COALESCE(SUM(CASE WHEN l.status = 'Approved' THEN l.days ELSE 0 END), 0), " +
           "COALESCE(SUM(CASE WHEN l.status = 'Pending' THEN l.days ELSE 0 END), 0) " +
           "FROM LeaveRequest l GROUP BY l.department")
    List<Object[]> findDepartmentUsage();
}
