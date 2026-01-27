package com.webapp.domain.admin.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.admin.entity.SystemSetting;
import com.webapp.domain.admin.repository.SystemSettingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingService {

  private final SystemSettingRepository systemSettingRepository;

  // Simple in-memory cache for maintenance mode to avoid DB hits on every request
  // In a clustered environment, use Redis or a distributed cache
  private volatile boolean cachedMaintenanceMode = false;
  private volatile long lastCacheUpdate = 0;
  private static final long CACHE_TTL_MS = 30000; // Refresh every 30 seconds

  @Transactional(readOnly = true)
  public Map<String, String> getAllSettings() {
    List<SystemSetting> settings = systemSettingRepository.findAll();
    Map<String, String> resultMap = new HashMap<>();
    for (SystemSetting setting : settings) {
      resultMap.put(setting.getKey(), setting.getValue());
    }
    return resultMap;
  }

  @Transactional
  public Map<String, String> updateSettings(Map<String, String> newSettings) {
    for (Map.Entry<String, String> entry : newSettings.entrySet()) {
      String key = entry.getKey();
      String value = entry.getValue();

      SystemSetting setting = systemSettingRepository.findByKey(key)
          .orElse(SystemSetting.builder().key(key).build());

      setting.setValue(value);
      setting.setDescription("Updated via Admin Panel");
      systemSettingRepository.save(setting);

      if ("maintenanceMode".equals(key)) {
        cachedMaintenanceMode = Boolean.parseBoolean(value);
        lastCacheUpdate = System.currentTimeMillis();
        log.info("Maintenance mode updated to: {}", cachedMaintenanceMode);
      }
    }
    return getAllSettings();
  }

  public boolean isMaintenanceModeEnabled() {
    if (System.currentTimeMillis() - lastCacheUpdate > CACHE_TTL_MS) {
      refreshMaintenanceModeCache();
    }
    return cachedMaintenanceMode;
  }

  private synchronized void refreshMaintenanceModeCache() {
    // Double-check locking pattern to minimize DB hits
    if (System.currentTimeMillis() - lastCacheUpdate <= CACHE_TTL_MS) {
      return;
    }

    try {
      SystemSetting setting = systemSettingRepository.findByKey("maintenanceMode").orElse(null);
      if (setting != null) {
        cachedMaintenanceMode = Boolean.parseBoolean(setting.getValue());
      } else {
        cachedMaintenanceMode = false;
      }
      lastCacheUpdate = System.currentTimeMillis();
    } catch (Exception e) {
      log.error("Failed to refresh maintenance mode cache", e);
      // Keep old value in case of DB error
    }
  }
}
