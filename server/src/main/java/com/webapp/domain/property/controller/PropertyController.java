package com.webapp.domain.property.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.property.dto.PropertyResponse;
import com.webapp.domain.property.service.PropertyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping("/my-properties")
    public ResponseEntity<List<PropertyResponse>> getMyProperties(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(propertyService.getMyProperties(userPrincipal.getId()));
    }

    @org.springframework.web.bind.annotation.PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PropertyResponse> createProperty(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestPart("data") com.webapp.domain.property.dto.PropertyRequest request,
            @org.springframework.web.bind.annotation.RequestPart(value = "files", required = false) List<org.springframework.web.multipart.MultipartFile> files) {
        return ResponseEntity.ok(propertyService.createProperty(request, files, userPrincipal.getId()));
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<PropertyResponse>> getRecommended(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(propertyService.getRecommendedProperties(userPrincipal.getId()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PropertyResponse>> searchProperties(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String query,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Double minPrice,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Double maxPrice,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Integer minBeds,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Integer minBaths,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String propertyType) {
        return ResponseEntity
                .ok(propertyService.searchProperties(query, minPrice, maxPrice, minBeds, minBaths, propertyType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getProperty(@org.springframework.web.bind.annotation.PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PropertyResponse> updatePropertyStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam String status) {
        return ResponseEntity.ok(propertyService.updatePropertyStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @org.springframework.web.bind.annotation.PathVariable Long id) {
        propertyService.deleteProperty(userPrincipal.getId(), id);
        return ResponseEntity.noContent().build();
    }

}
