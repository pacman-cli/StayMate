package com.webapp.domain.setting.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.domain.setting.service.SystemSettingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentController {

    private final SystemSettingService settingService;

    private static final List<String> PUBLIC_KEYS = List.of(
            "siteName",
            "privacy_policy",
            "terms_of_service",
            "faq_content",
            "about_us",
            "contact_email",
            "social_links");

    /**
     * Returns public settings from available settings
     */
    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> getPublicContent() {
        Map<String, String> allSettings = settingService.getAllSettings();
        Map<String, String> publicSettings = new HashMap<>();

        for (String key : PUBLIC_KEYS) {
            if (allSettings.containsKey(key)) {
                publicSettings.put(key, allSettings.get(key));
            }
        }

        return ResponseEntity.ok(publicSettings);
    }
}
