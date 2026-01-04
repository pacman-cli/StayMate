package com.webapp.domain.property.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.property.dto.PropertyRequest;
import com.webapp.domain.property.dto.PropertyResponse;
import com.webapp.domain.property.entity.Property;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyService {

        private final PropertyRepository propertyRepository;
        private final UserRepository userRepository;
        private final com.webapp.service.FileStorageService fileStorageService;

        @Transactional
        public PropertyResponse createProperty(PropertyRequest request,
                        List<org.springframework.web.multipart.MultipartFile> files, Long ownerId) {
                User owner = userRepository.findById(ownerId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Handle File Uploads
                String imageUrl = null;
                if (files != null && !files.isEmpty()) {
                        // For now, we only store the first image as the main image
                        // In a real app, we would store all of them in a separate table
                        String fileName = fileStorageService.storeFile(files.get(0));

                        // Generate full URL (assuming served from static resource handler or Nginx)
                        // For local dev, we might return just the filename or a relative path
                        imageUrl = "/uploads/" + fileName;
                } else if (request.getImages() != null && !request.getImages().isEmpty()) {
                        // Fallback to URL if provided manually
                        imageUrl = request.getImages().get(0);
                }

                String location = request.getAddress() + ", " + request.getCity() + " " + request.getZipCode();

                Property property = Property.builder()
                                .title(request.getTitle())
                                .description(request.getDescription())
                                .price(request.getPrice().toString())
                                .priceAmount(request.getPrice())
                                .location(location)
                                .beds(request.getBeds())
                                .baths(request.getBaths())
                                .sqft(request.getArea().intValue())
                                .propertyType(request.getPropertyType())
                                .imageUrl(imageUrl)
                                .owner(owner)
                                .status("Active")
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
                // Simple recommendation: return properties NOT owned by the user
                // Using page size 5 for dashboard
                return propertyRepository.findAllByOwnerIdNot(userId, PageRequest.of(0, 5))
                                .getContent().stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<PropertyResponse> searchProperties(String query, Double minPrice, Double maxPrice, Integer minBeds,
                        Integer minBaths, String propertyType) {
                java.math.BigDecimal decimalMinPrice = minPrice != null ? java.math.BigDecimal.valueOf(minPrice) : null;
                java.math.BigDecimal decimalMaxPrice = maxPrice != null ? java.math.BigDecimal.valueOf(maxPrice) : null;

                return propertyRepository
                                .searchProperties(query, decimalMinPrice, decimalMaxPrice, minBeds, minBaths,
                                                propertyType)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        private PropertyResponse mapToResponse(Property property) {
                return PropertyResponse.builder()
                                .id(property.getId())
                                .title(property.getTitle())
                                .description(property.getDescription())
                                .location(property.getLocation())
                                .price(property.getPrice())
                                .beds(property.getBeds())
                                .baths(property.getBaths())
                                .sqft(property.getSqft())
                                .rating(property.getRating())
                                .verified(property.isVerified())
                                .status(property.getStatus())
                                .views(property.getViews())
                                .inquiries(property.getInquiries())
                                .priceAmount(property.getPriceAmount())
                                .ownerId(property.getOwner().getId())
                                .ownerName(property.getOwner().getFirstName() + " " + property.getOwner().getLastName())
                                .imageUrl(property.getImageUrl())
                                .build();
        }

        @Transactional(readOnly = true)
        public PropertyResponse getPropertyById(Long id) {
                return propertyRepository.findById(id)
                                .map(this::mapToResponse)
                                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        }

        @Transactional
        public PropertyResponse updatePropertyStatus(Long id, String status) {
                Property property = propertyRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
                property.setStatus(status);
                return mapToResponse(propertyRepository.save(property));
        }

        @Transactional(readOnly = true)
        public List<PropertyResponse> getAllProperties() {
                return propertyRepository.findAll().stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
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
