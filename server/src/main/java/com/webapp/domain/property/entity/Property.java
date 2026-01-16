package com.webapp.domain.property.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.webapp.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "properties")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String location;

    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    private String price; // Storing as String for display, e.g. "$1,200/mo"

    @Column(name = "price_amount")
    private BigDecimal priceAmount; // For sorting/filtering

    private int beds;
    private int baths;
    private int sqft;

    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    @Column(name = "property_type", nullable = false)
    private com.webapp.domain.property.enums.PropertyType propertyType;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Builder.Default
    private double rating = 0.0;

    @Builder.Default
    private boolean verified = false;

    @Builder.Default
    private int views = 0;

    @Builder.Default
    private int inquiries = 0;

    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private com.webapp.domain.property.enums.PropertyStatus status = com.webapp.domain.property.enums.PropertyStatus.PENDING; // Default
    // to
    // Pending

    @Column(name = "emergency_available")
    @Builder.Default
    private boolean emergencyAvailable = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @jakarta.persistence.Transient
    @Builder.Default
    private boolean isSaved = false;
}
