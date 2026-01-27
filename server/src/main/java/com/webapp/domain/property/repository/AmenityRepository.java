package com.webapp.domain.property.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.domain.property.entity.Amenity;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {
  Optional<Amenity> findByName(String name);
}
