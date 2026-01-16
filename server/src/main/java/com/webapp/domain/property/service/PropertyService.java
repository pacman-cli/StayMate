package com.webapp.domain.property.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.webapp.domain.file.service.FileStorageService;
import com.webapp.domain.property.dto.PropertyRequest;
import com.webapp.domain.property.dto.PropertyResponse;
import com.webapp.domain.property.entity.Property;
import com.webapp.domain.property.enums.PropertyStatus;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;
import com.webapp.domain.verification.service.VerificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final VerificationService verificationService;

    @Transactional
    public PropertyResponse createProperty(PropertyRequest request,
                                           List<MultipartFile> files, Long ownerId) {
        // Enforce 100% Verification
        verificationService.validateUserVerification(ownerId);

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Handle File Uploads
        String imageUrl = null;
        if (files != null && !files.isEmpty()) {
            // Store file and get full MinIO URL back
            imageUrl = fileStorageService.storeFile(files.get(0));
        } else if (request.getImages() != null && !request.getImages().isEmpty()) {
            // Fallback to URL if provided manually
            imageUrl = request.getImages().get(0);
        }

        String location = request.getAddress() + ", " + request.getCity() + " " + request.getZipCode();

        // Sets derived and request image URL
        Property property = Property.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice().toString())
                .priceAmount(request.getPrice())
                .location(location)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .beds(request.getBeds())
                .baths(request.getBaths())
                .sqft(request.getArea().intValue())
                .propertyType(request.getPropertyType())
                .imageUrl(imageUrl)
                .owner(owner)
                .status(PropertyStatus.PENDING) // Default to Pending
                .build();

        return mapToResponse(propertyRepository.save(property));
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> getMyProperties(Long userId) {
        return propertyRepository.findAllByOwnerId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> getRecommendedProperties(Long userId) {
        // Simple recommendation: return properties NOT owned by the user AND valid
        // status
        // Using page size 5 for dashboard
        // NOTE: Repository method findAllByOwnerIdNot doesn't filter by status,
        // so we should use a custom query or filter in stream.
        // Better approach: use repository method that supports status.

        // For now, let's filter in stream to avoid changing repository signature
        // immediately if unnecessary,
        // BUT logically we should fetch only APPROVED properties.

        // Let's assume we want to show APPROVED properties only.
        return propertyRepository.findTop5ByStatusOrderByPriceAmountAsc(PropertyStatus.APPROVED).stream()
                .filter(p -> !p.getOwner().getId().equals(userId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Searches properties by criteria; returns approved/active results
     */
    @Transactional(readOnly = true)
    public List<PropertyResponse> searchProperties(String query, Double minPrice, Double maxPrice, Integer minBeds,
                                                   Integer minBaths, String propertyType) {
        java.math.BigDecimal decimalMinPrice = minPrice != null ? java.math.BigDecimal.valueOf(minPrice) : null;
        java.math.BigDecimal decimalMaxPrice = maxPrice != null ? java.math.BigDecimal.valueOf(maxPrice) : null;

        return propertyRepository
                .searchProperties(query, decimalMinPrice, decimalMaxPrice, minBeds, minBaths,
                        propertyType,
                        java.util.List.of(PropertyStatus.APPROVED, PropertyStatus.ACTIVE))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PropertyResponse mapToResponse(Property property) {
        // Maps property details to response: id, title, description, location
        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .location(property.getLocation())
                .latitude(property.getLatitude())
                .longitude(property.getLongitude())
                .price(property.getPrice())
                .beds(property.getBeds())
                .baths(property.getBaths())
                .sqft(property.getSqft())
                .rating(property.getRating())
                .verified(property.isVerified())
                .status(property.getStatus().getDisplayName())
                .views(property.getViews())
                .inquiries(property.getInquiries())
                .priceAmount(property.getPriceAmount())
                .ownerId(property.getOwner().getId())
                .ownerName(property.getOwner().getFirstName() + " " + property.getOwner().getLastName())
                .imageUrl(property.getImageUrl())
                .images(property.getImageUrl() != null ? java.util.List.of(property.getImageUrl())
                        : java.util.Collections.emptyList())
                .build();
    }

    /**
     * Retrieves property details if owned by user
     */
    @Transactional(readOnly = true)
    public PropertyResponse getPropertyDetailsForOwner(Long propertyId, Long userId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (!property.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You do not own this property");
        }

        return mapToResponse(property);
    }

    @Transactional(readOnly = true)
    public PropertyResponse getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
    }

    @Transactional
    public PropertyResponse updatePropertyStatus(Long id, String statusStr, Long requesterId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ownership or admin check
        if (!property.getOwner().getId().equals(requesterId) && !requester.isAdmin()) {
            throw new RuntimeException("You don't have permission to update this property");
        }

        try {
            PropertyStatus status = PropertyStatus.valueOf(statusStr.toUpperCase());
            property.setStatus(status);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + statusStr);
        }
        return mapToResponse(propertyRepository.save(property));
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> getAllProperties() {
        return propertyRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PropertyResponse updateProperty(Long id, PropertyRequest request,
                                           List<MultipartFile> files, Long requesterId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ownership or admin check
        if (!property.getOwner().getId().equals(requesterId) && !requester.isAdmin()) {
            throw new RuntimeException("You don't have permission to update this property");
        }

        // Handle File Uploads (if new files provided)
        if (files != null && !files.isEmpty()) {
            // Store file and get full MinIO URL back
            String imageUrl = fileStorageService.storeFile(files.get(0));
            property.setImageUrl(imageUrl);
        }

        // Update property fields
        String location = request.getAddress() + ", " + request.getCity() + " " + request.getZipCode();

        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setPrice(request.getPrice().toString());
        property.setPriceAmount(request.getPrice());
        property.setLocation(location);
        property.setLatitude(request.getLatitude());
        property.setLongitude(request.getLongitude());
        property.setBeds(request.getBeds());
        property.setBaths(request.getBaths());
        property.setSqft(request.getArea().intValue());
        property.setPropertyType(request.getPropertyType());

        return mapToResponse(propertyRepository.save(property));
    }

    @Transactional
    public void deleteProperty(Long userId, Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        // Verify ownership
        if (!property.getOwner().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to delete this property");
        }

        propertyRepository.delete(property);
    }
}
