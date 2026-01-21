package com.webapp.domain.maintenance.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import com.webapp.domain.property.entity.Property;
import com.webapp.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity for maintenance/complaint requests from tenants.
 */
@Entity
@Table(name = "maintenance_requests", indexes = {
    @Index(name = "idx_maint_property", columnList = "property_id"),
    @Index(name = "idx_maint_requester", columnList = "requester_id"),
    @Index(name = "idx_maint_status", columnList = "status"),
    @Index(name = "idx_maint_priority", columnList = "priority")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "property_id", nullable = false)
  private Property property;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "requester_id", nullable = false)
  private User requester;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "assigned_to")
  private User assignedTo;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String description;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  @Column(nullable = false)
  @Builder.Default
  private RequestType type = RequestType.MAINTENANCE;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  @Column(nullable = false)
  @Builder.Default
  private Priority priority = Priority.MEDIUM;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  @Column(nullable = false)
  @Builder.Default
  private Status status = Status.OPEN;

  @Column(columnDefinition = "TEXT")
  private String resolution;

  @Column(name = "resolved_at")
  private LocalDateTime resolvedAt;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  public enum RequestType {
    MAINTENANCE, // Repairs, fixes
    COMPLAINT, // Issues with neighbors, etc.
    IMPROVEMENT, // Requests for upgrades
    EMERGENCY // Urgent issues
  }

  public enum Priority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
  }

  public enum Status {
    OPEN,
    IN_PROGRESS,
    ON_HOLD,
    RESOLVED,
    CLOSED,
    CANCELLED
  }
}
