package com.webapp.domain.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyResponse {
    private Long id;
    private String title;
    private String description;
    private String location;
    private String price;
    private int beds;
    private int baths;
    private int sqft;
    private double rating;
    private boolean verified;
    private String status;
    private int reviewsCount;
    private int views;
    private int inquiries;
    private java.math.BigDecimal priceAmount;
    private String ownerName;
    private Long ownerId;
    private String imageUrl;
    private java.util.List<String> images;
    private Double latitude;
    private Double longitude;
    private String propertyType;
    private java.util.Set<com.webapp.domain.property.entity.Amenity> amenities;
    private boolean isSaved;
}
