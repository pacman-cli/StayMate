package com.webapp.domain.property.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.property.entity.Amenity;
import com.webapp.domain.property.repository.AmenityRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AmenityService {

  private final AmenityRepository amenityRepository;

  @EventListener(ApplicationReadyEvent.class)
  @Transactional
  public void seedAmenities() {
    if (amenityRepository.count() > 0) {
      return;
    }
    log.info("Seeding default amenities...");

    List<Amenity> defaults = Arrays.asList(
        Amenity.builder().name("Wifi").iconName("Wifi").category("Connectivity").build(),
        Amenity.builder().name("TV").iconName("Tv").category("Entertainment").build(),
        Amenity.builder().name("Kitchen").iconName("Utensils").category("Facilities").build(),
        Amenity.builder().name("Washer").iconName("WashingMachine").category("Facilities").build(),
        Amenity.builder().name("Air Conditioning").iconName("Wind").category("Climate").build(),
        Amenity.builder().name("Heating").iconName("Thermometer").category("Climate").build(),
        Amenity.builder().name("Workspace").iconName("Briefcase").category("Productivity").build(),
        Amenity.builder().name("Pool").iconName("Waves").category("Recreation").build(),
        Amenity.builder().name("Gym").iconName("Dumbbell").category("Recreation").build(),
        Amenity.builder().name("Parking").iconName("Car").category("Facilities").build(),
        Amenity.builder().name("Elevator").iconName("ArrowUpCircle").category("Facilities").build(),
        Amenity.builder().name("Security").iconName("ShieldCheck").category("Safety").build(),
        Amenity.builder().name("First Aid").iconName("Cross").category("Safety").build(),
        Amenity.builder().name("Fire Extinguisher").iconName("Flame").category("Safety").build());

    amenityRepository.saveAll(defaults);
    log.info("Seeded {} amenities", defaults.size());
  }

  public List<Amenity> getAllAmenities() {
    return amenityRepository.findAll();
  }
}
