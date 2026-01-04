package com.webapp.domain.setting.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
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
@Table(name = "system_settings")
public class SystemSetting {

  @Id
  @Column(name = "setting_key", nullable = false, unique = true)
  private String key;

  @Column(name = "setting_value", columnDefinition = "TEXT")
  private String value;

  private String description;

  @UpdateTimestamp
  private LocalDateTime updatedAt;
}
