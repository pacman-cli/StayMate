package com.webapp.domain.setting.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.setting.entity.SystemSetting;
import com.webapp.domain.setting.repository.SystemSettingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

  private final SystemSettingRepository settingRepository;

  @Transactional(readOnly = true)
  public Map<String, String> getAllSettings() {
    List<SystemSetting> settings = settingRepository.findAll();
    // Return as map for easy consumption specific to settings
    Map<String, String> map = new HashMap<>();
    settings.forEach(s -> map.put(s.getKey(), s.getValue()));
    return map;
  }

  @Transactional(readOnly = true)
  public List<SystemSetting> getAllSettingsList() {
    return settingRepository.findAll();
  }

  @Transactional
  public SystemSetting updateSetting(String key, String value) {
    SystemSetting setting = settingRepository.findByKey(key)
        .orElse(SystemSetting.builder().key(key).build());

    setting.setValue(value);
    return settingRepository.save(setting);
  }

  @Transactional
  public void bulkUpdate(Map<String, String> settings) {
    settings.forEach(this::updateSetting);
  }

  public String getSettingValue(String key, String defaultValue) {
    return settingRepository.findByKey(key)
        .map(SystemSetting::getValue)
        .orElse(defaultValue);
  }
}
