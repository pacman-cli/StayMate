package com.webapp.domain.property.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.domain.property.entity.Amenity;
import com.webapp.domain.property.service.AmenityService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/amenities")
@RequiredArgsConstructor
public class AmenityController {

  private final AmenityService amenityService;

  @GetMapping
  public ResponseEntity<List<Amenity>> getAllAmenities() {
    return ResponseEntity.ok(amenityService.getAllAmenities());
  }
}
