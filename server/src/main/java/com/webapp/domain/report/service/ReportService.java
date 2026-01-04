package com.webapp.domain.report.service;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.report.entity.Report;
import com.webapp.domain.report.enums.ReportStatus;
import com.webapp.domain.report.repository.ReportRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportService {

  private final ReportRepository reportRepository;

  @Transactional(readOnly = true)
  public List<Report> getAllReports() {
    return reportRepository.findAll();
  }

  @Transactional(readOnly = true)
  public List<Report> getPendingReports() {
    return reportRepository.findByStatus(ReportStatus.PENDING);
  }

  @Transactional
  public Report resolveReport(@NonNull Long id, String resolutionNotes) {
    Report report = reportRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Report not found"));

    report.setStatus(ReportStatus.RESOLVED);
    report.setAdminNotes(resolutionNotes);
    return reportRepository.save(report);
  }

  @Transactional
  public Report dismissReport(@NonNull Long id, String notes) {
    Report report = reportRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Report not found"));

    report.setStatus(ReportStatus.DISMISSED);
    report.setAdminNotes(notes);
    return reportRepository.save(report);
  }
}
