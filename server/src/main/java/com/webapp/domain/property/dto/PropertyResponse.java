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
    private int views;
    private int inquiries;
    private java.math.BigDecimal priceAmount;
    private String ownerName;
    private Long ownerId;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
}
