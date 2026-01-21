package com.webapp.domain.finance.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import com.webapp.domain.finance.enums.PayoutMethodVerificationStatus;
import com.webapp.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "payout_methods")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutMethod {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "bank_name", nullable = false)
  private String bankName;

  @Column(name = "account_number", nullable = false)
  private String accountNumber;

  @Column(name = "account_holder_name", nullable = false)
  private String accountHolderName;

  @Column(name = "routing_number")
  private String routingNumber;

  @Column(name = "currency", nullable = false)
  private String currency;

  @Builder.Default
  @Column(name = "is_default")
  private boolean isDefault = false;

  // Verification fields
  @Builder.Default
  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  @Column(name = "verification_status")
  private PayoutMethodVerificationStatus verificationStatus = PayoutMethodVerificationStatus.PENDING;

  @Column(name = "verification_document_url", length = 500)
  private String verificationDocumentUrl;

  @Column(name = "verified_at")
  private LocalDateTime verifiedAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "verified_by")
  private User verifiedBy;

  @Column(name = "rejection_reason", length = 500)
  private String rejectionReason;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
}
