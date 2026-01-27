package com.webapp.domain.property.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.property.dto.PropertyRequest;
import com.webapp.domain.property.dto.PropertyResponse;
import com.webapp.domain.property.service.PropertyService;

import jakarta.validation.Valid;
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

    @GetMapping("/my-properties/{id}")
    public ResponseEntity<PropertyResponse> getMyPropertyDetails(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyDetailsForOwner(id, userPrincipal.getId()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('HOUSE_OWNER', 'ADMIN')")
    public ResponseEntity<PropertyResponse> createProperty(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestPart("data") PropertyRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        return ResponseEntity.ok(propertyService.createProperty(request, files, userPrincipal.getId()));
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<PropertyResponse>> getRecommended(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(propertyService.getRecommendedProperties(userPrincipal.getId()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PropertyResponse>> searchProperties(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minBeds,
            @RequestParam(required = false) Integer minBaths,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) List<Long> amenityIds) {
        return ResponseEntity
                .ok(propertyService.searchProperties(query, minPrice, maxPrice, minBeds, minBaths, propertyType,
                        amenityIds));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getProperty(@org.springframework.web.bind.annotation.PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    @PatchMapping("/{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('HOUSE_OWNER', 'ADMIN')")
    public ResponseEntity<PropertyResponse> updatePropertyStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(propertyService.updatePropertyStatus(id, status, userPrincipal.getId()));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('HOUSE_OWNER', 'ADMIN')")
    public ResponseEntity<PropertyResponse> updateProperty(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestPart("data") PropertyRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        return ResponseEntity.ok(propertyService.updateProperty(id, request, files, userPrincipal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        propertyService.deleteProperty(userPrincipal.getId(), id);
        return ResponseEntity.noContent().build();
    }

}
