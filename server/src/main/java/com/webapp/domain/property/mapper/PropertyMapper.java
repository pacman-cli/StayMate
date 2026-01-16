package com.webapp.domain.property.mapper;

import org.springframework.stereotype.Component;

import com.webapp.domain.property.dto.PropertyResponse;
import com.webapp.domain.property.entity.Property;

@Component
public class PropertyMapper {

    public PropertyResponse toResponse(Property property) {
        if (property == null) {
            return null;
        }

        // Maps basic property details to response
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
                .propertyType(property.getPropertyType().name())
                .imageUrl(property.getImageUrl())
                // Assuming isSaved is populated before mapping, or handled by caller if needed
                // Currently response DTO might not have isSaved logic unless added
                .build();
    }
}
