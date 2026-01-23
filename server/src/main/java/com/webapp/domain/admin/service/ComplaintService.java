package com.webapp.domain.admin.service;

import java.util.List;

import com.webapp.domain.admin.dto.ComplaintRequest;
import com.webapp.domain.admin.dto.ComplaintResponse;
import com.webapp.domain.admin.enums.ComplaintStatus;

public interface ComplaintService {

  ComplaintResponse createComplaint(Long reporterId, ComplaintRequest request);

  ComplaintResponse getComplaintById(Long id);

  List<ComplaintResponse> getAllComplaints();

  List<ComplaintResponse> getComplaintsByStatus(ComplaintStatus status);

  ComplaintResponse updateComplaintStatus(Long id, ComplaintStatus status);

  void deleteComplaint(Long id);

  long countByStatus(ComplaintStatus status);
}
