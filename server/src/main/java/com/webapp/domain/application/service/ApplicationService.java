package com.webapp.domain.application.service;

import com.webapp.domain.application.dto.ApplicationRequest;
import com.webapp.domain.application.dto.ApplicationResponse;
import com.webapp.domain.application.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ApplicationService {

    ApplicationResponse sendApplication(Long userId, ApplicationRequest request);

    ApplicationResponse getApplicationById(Long applicationId);

    ApplicationResponse updateApplicationStatus(Long userId, Long applicationId, ApplicationStatus status);

    Page<ApplicationResponse> getSentApplications(Long userId, Pageable pageable);

    Page<ApplicationResponse> getReceivedApplications(Long userId, Pageable pageable);

    void deleteApplication(Long userId, Long applicationId);
}
