package com.webapp.domain.report.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.webapp.domain.report.entity.Report;
import com.webapp.domain.report.enums.ReportSeverity;
import com.webapp.domain.report.enums.ReportStatus;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    long countByStatus(ReportStatus status);

    long countBySeverity(ReportSeverity severity);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.severity IN ('HIGH', 'CRITICAL') AND r.status = 'PENDING'")
    long countHighRiskReports();

    org.springframework.data.domain.Page<Report> findRecentRiskyReports(
            org.springframework.data.domain.Pageable pageable);

    java.util.List<Report> findByStatus(ReportStatus status);
}
