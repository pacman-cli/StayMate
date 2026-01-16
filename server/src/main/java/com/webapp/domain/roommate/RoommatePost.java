package com.webapp.domain.roommate;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.webapp.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "roommate_posts")
public class RoommatePost {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  private String location;

  @Column(nullable = false)
  private Double budget;

  @Column(name = "move_in_date")
  private LocalDate moveInDate;

  private Double latitude;
  private Double longitude;

  @Column(columnDefinition = "TEXT")
  private String bio;

  // Preferences
  @Column(name = "gender_preference")
  private String genderPreference; // MALE, FEMALE, ANY

  private Boolean smoking; // true = ok with smoking / is smoker
  private Boolean pets; // true = ok with pets / has pets
  private String occupation; // STUDENT, PROFESSIONAL, ANY

  // AI Matching Fields
  @Column(name = "cleanliness")
  @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
  private CleanlinessLevel cleanliness;

  @Column(name = "sleep_schedule")
  @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
  private SleepSchedule sleepSchedule;

  @Column(name = "personality_tags")
  private java.util.List<String> personalityTags;

  @Column(name = "interests")
  private java.util.List<String> interests;

  @Column(name = "status")
  @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
  @Builder.Default
  private RoommatePostStatus status = RoommatePostStatus.PENDING;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
