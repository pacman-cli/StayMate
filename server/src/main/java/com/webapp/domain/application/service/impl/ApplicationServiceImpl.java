package com.webapp.domain.application.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.application.dto.ApplicationRequest;
import com.webapp.domain.application.dto.ApplicationResponse;
import com.webapp.domain.application.entity.Application;
import com.webapp.domain.application.enums.ApplicationStatus;
import com.webapp.domain.application.mapper.ApplicationMapper;
import com.webapp.domain.application.repository.ApplicationRepository;
import com.webapp.domain.application.service.ApplicationService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserService userService;
    private final com.webapp.domain.property.repository.PropertyRepository propertyRepository;
    private final ApplicationMapper applicationMapper;
    private final com.webapp.domain.notification.service.NotificationService notificationService;

    @Override
    @Transactional
    public ApplicationResponse sendApplication(Long userId, ApplicationRequest request) {
        User sender = userService.getUserById(userId);

        // Find Property
        com.webapp.domain.property.entity.Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        User receiver = property.getOwner();

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("You cannot apply to your own property");
        }

        // Check if application already exists
        if (applicationRepository.findBySenderAndReceiver(sender, receiver).isPresent()) {
            // Optional: check if for exact same property?
            // For now, allow multiple applications if improved logic, but keep simple for
            // now
            // throw new IllegalArgumentException("Application already exists");
        }

        Application application = Application.builder()
                .sender(sender)
                .receiver(receiver)
                .property(property)
                .message(request.getMessage())
                .status(ApplicationStatus.PENDING)
                .build();

        Application savedApplication = applicationRepository.save(application);

        // Notify Owner
        notificationService.createNotificationForUser(
                receiver.getId(),
                com.webapp.domain.notification.enums.NotificationType.APPLICATION_RECEIVED,
                "New Application for " + property.getTitle(),
                sender.getFirstName() + " has applied for your property: " + property.getTitle(),
                "/dashboard/applications/received" // Link to owner dashboard
        );

        return applicationMapper.toResponse(savedApplication);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        return applicationMapper.toResponse(application);
    }

    @Override
    @Transactional
    public ApplicationResponse updateApplicationStatus(Long userId, Long applicationId, ApplicationStatus status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        // Only receiver can accept/reject
        // Sender can cancel
        if (status == ApplicationStatus.CANCELLED) {
            if (!application.getSender().getId().equals(userId)) {
                throw new SecurityException("Only sender can cancel application");
            }
        } else if (status == ApplicationStatus.ACCEPTED || status == ApplicationStatus.REJECTED) {
            if (!application.getReceiver().getId().equals(userId)) {
                throw new SecurityException("Only receiver can accept/reject application");
            }
        } else {
            throw new IllegalArgumentException("Invalid status update");
        }

        application.setStatus(status);
        Application updatedApplication = applicationRepository.save(application);

        // Notify Sender on Acceptance/Rejection
        if (status == ApplicationStatus.ACCEPTED) {
            notificationService.createNotificationForUser(
                    application.getSender().getId(),
                    com.webapp.domain.notification.enums.NotificationType.APPLICATION_ACCEPTED,
                    "Application Accepted!",
                    "Congratulations! Your application for " + application.getProperty().getTitle()
                            + " has been accepted.",
                    "/dashboard/applications" // Link to user dashboard
            );
        } else if (status == ApplicationStatus.REJECTED) {
            notificationService.createNotificationForUser(
                    application.getSender().getId(),
                    com.webapp.domain.notification.enums.NotificationType.APPLICATION_REJECTED,
                    "Application Update",
                    "Your application for " + application.getProperty().getTitle() + " was not accepted.",
                    "/dashboard/applications" // Link to user dashboard
            );
        }

        return applicationMapper.toResponse(updatedApplication);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getSentApplications(Long userId, Pageable pageable) {
        User sender = userService.getUserById(userId);
        return applicationRepository.findBySender(sender, pageable)
                .map(applicationMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getReceivedApplications(Long userId, Pageable pageable) {
        User receiver = userService.getUserById(userId);
        return applicationRepository.findByReceiver(receiver, pageable)
                .map(applicationMapper::toResponse);
    }

    @Override
    @Transactional
    public void deleteApplication(Long userId, Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        if (!application.getSender().getId().equals(userId) && !application.getReceiver().getId().equals(userId)) {
            throw new SecurityException("Not authorized to delete this application");
        }

        applicationRepository.delete(application);
    }
}
