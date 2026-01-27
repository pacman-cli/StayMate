package com.webapp.domain.inquiry.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.auth.exception.ResourceNotFoundException;
import com.webapp.domain.inquiry.dto.InquiryDTO;
import com.webapp.domain.inquiry.entity.Inquiry;
import com.webapp.domain.inquiry.entity.InquiryStatus;
import com.webapp.domain.inquiry.repository.InquiryRepository;
import com.webapp.domain.property.entity.Property;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.user.entity.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final PropertyRepository propertyRepository;
    private final com.webapp.domain.notification.service.NotificationService notificationService;

    @Transactional
    public InquiryDTO.Response createInquiry(User sender, InquiryDTO.CreateRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        Inquiry inquiry = Inquiry.builder()
                .sender(sender)
                .property(property)
                .owner(property.getOwner())
                .message(request.getMessage())
                .status(InquiryStatus.PENDING)
                .build();

        Inquiry saved = inquiryRepository.save(inquiry);

        // Notify Owner
        notificationService.createNotificationForUser(
                saved.getOwner().getId(),
                com.webapp.domain.notification.enums.NotificationType.PROPERTY_INQUIRY,
                "New Inquiry: " + property.getTitle(),
                "You received an inquiry from " + sender.getFirstName() + " regarding "
                        + property.getTitle(),
                "/dashboard/inquiries" // Correct link to owner dashboard
        );

        return mapToResponse(saved);
    }

    @Transactional
    public InquiryDTO.Response replyToInquiry(User owner, Long inquiryId, String replyMessage) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found"));

        if (!inquiry.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Not authorized to reply to this inquiry");
        }

        inquiry.setReply(replyMessage);
        inquiry.setStatus(InquiryStatus.REPLIED);
        Inquiry saved = inquiryRepository.save(inquiry);

        // Notify Sender
        notificationService.createNotificationForUser(
                saved.getSender().getId(),
                com.webapp.domain.notification.enums.NotificationType.NEW_MESSAGE,
                "New Reply: " + saved.getProperty().getTitle(),
                "The owner replied to your inquiry: "
                        + (replyMessage.length() > 50 ? replyMessage.substring(0, 50) + "..."
                        : replyMessage),
                "/dashboard/my-inquiries" // Link to user dashboard
        );

        return mapToResponse(saved);
    }

    public Page<InquiryDTO.Response> getOwnerInquiries(User owner, Pageable pageable) {
        return inquiryRepository.findByOwnerOrderByCreatedAtDesc(owner, pageable)
                .map(this::mapToResponse);
    }

    public Page<InquiryDTO.Response> getUserInquiries(User sender, Pageable pageable) {
        return inquiryRepository.findBySenderOrderByCreatedAtDesc(sender, pageable)
                .map(this::mapToResponse);
    }

    private InquiryDTO.Response mapToResponse(Inquiry inquiry) {
        // Maps inquiry to response, including property details
        return InquiryDTO.Response.builder()
                .id(inquiry.getId())
                .propertyId(inquiry.getProperty().getId())
                .propertyTitle(inquiry.getProperty().getTitle())
                .propertyImage(inquiry.getProperty().getImageUrl())
                .senderId(inquiry.getSender().getId())
                .senderName(inquiry.getSender().getFirstName() + " "
                        + inquiry.getSender().getLastName())
                .senderEmail(inquiry.getSender().getEmail())
                .senderProfilePictureUrl(inquiry.getSender().getProfilePictureUrl())
                .message(inquiry.getMessage())
                .reply(inquiry.getReply())
                .status(inquiry.getStatus())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}
