package com.webapp.domain.property.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import com.webapp.domain.property.enums.PropertyType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String state;

    @NotBlank(message = "Zip code is required")
    private String zipCode;

    private Double latitude;
    private Double longitude;

    @Min(value = 0, message = "Beds must be 0 or more")
    private Integer beds;

    @Min(value = 0, message = "Baths must be 0 or more")
    private Integer baths;

    @Positive(message = "Area must be positive")
    private Double area;

    @NotNull(message = "Property type is required")
    private PropertyType propertyType;

    private Set<Long> amenityIds;

    private List<String> images;
}
