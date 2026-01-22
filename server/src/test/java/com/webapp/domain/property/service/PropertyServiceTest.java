package com.webapp.domain.property.service;

import static com.webapp.domain.property.enums.PropertyType.APARTMENT;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.webapp.domain.file.service.FileStorageService;
import com.webapp.domain.property.dto.PropertyResponse;
import com.webapp.domain.property.entity.Property;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("PropertyService Tests")
class PropertyServiceTest {

  @Mock
  private PropertyRepository propertyRepository;

  @Mock
  private UserRepository userRepository;

  @Mock
  private FileStorageService fileStorageService;

  @InjectMocks
  private PropertyService propertyService;

  private User testUser;
  private Property testProperty;

  @BeforeEach
  void setUp() {
    testUser = User.builder()
        .id(1L)
        .firstName("John")
        .lastName("Doe")
        .email("john@example.com")
        .build();

    testProperty = Property.builder()
        .id(1L)
        .title("Nice Apartment")
        .description("A cozy apartment")
        .price("1500")
        .priceAmount(BigDecimal.valueOf(1500))
        .location("123 Main St, City 12345")
        .beds(2)
        .baths(1)
        .sqft(800)
        .propertyType(APARTMENT)
        .status(com.webapp.domain.property.enums.PropertyStatus.ACTIVE)
        .owner(testUser)
        .build();
  }

  @Test
  @DisplayName("Should get property by ID")
  void shouldGetPropertyById() {
    when(propertyRepository.findById(1L)).thenReturn(Optional.of(testProperty));

    PropertyResponse response = propertyService.getPropertyById(1L);

    assertNotNull(response);
    assertEquals("Nice Apartment", response.getTitle());
    assertEquals(1L, response.getOwnerId());
    verify(propertyRepository).findById(1L);
  }

  @Test
  @DisplayName("Should throw exception when property not found")
  void shouldThrowExceptionWhenPropertyNotFound() {
    when(propertyRepository.findById(999L)).thenReturn(Optional.empty());

    assertThrows(RuntimeException.class, () -> propertyService.getPropertyById(999L));
  }

  @Test
  @DisplayName("Should get my properties")
  void shouldGetMyProperties() {
    when(propertyRepository.findAllByOwnerId(1L)).thenReturn(List.of(testProperty));

    List<PropertyResponse> properties = propertyService.getMyProperties(1L);

    assertNotNull(properties);
    assertEquals(1, properties.size());
    assertEquals("Nice Apartment", properties.get(0).getTitle());
  }

  @Test
  @DisplayName("Should update property status")
  void shouldUpdatePropertyStatus() {
    when(propertyRepository.findById(1L)).thenReturn(Optional.of(testProperty));
    when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
    when(propertyRepository.save(any(Property.class))).thenReturn(testProperty);

    PropertyResponse response = propertyService.updatePropertyStatus(1L, "Inactive", 1L);

    assertNotNull(response);
    verify(propertyRepository).save(any(Property.class));
  }

  @Test
  @DisplayName("Should throw exception when non-owner tries to update status")
  void shouldThrowExceptionWhenNonOwnerTriesToUpdateStatus() {
    when(propertyRepository.findById(1L)).thenReturn(Optional.of(testProperty));

    User otherUser = User.builder().id(999L).build();
    when(userRepository.findById(999L)).thenReturn(Optional.of(otherUser));

    assertThrows(RuntimeException.class, () -> propertyService.updatePropertyStatus(1L, "Inactive", 999L));
  }

  @Test
  @DisplayName("Should delete property when owner matches")
  void shouldDeletePropertyWhenOwnerMatches() {
    when(propertyRepository.findById(1L)).thenReturn(Optional.of(testProperty));

    assertDoesNotThrow(() -> propertyService.deleteProperty(1L, 1L));

    verify(propertyRepository).delete(testProperty);
  }

  @Test
  @DisplayName("Should throw exception when non-owner tries to delete")
  void shouldThrowExceptionWhenNonOwnerTriesToDelete() {
    when(propertyRepository.findById(1L)).thenReturn(Optional.of(testProperty));

    assertThrows(RuntimeException.class, () -> propertyService.deleteProperty(999L, 1L));
    verify(propertyRepository, never()).delete(any());
  }

  @Test
  @DisplayName("Should get all properties")
  void shouldGetAllProperties() {
    when(propertyRepository.findAll()).thenReturn(List.of(testProperty));

    List<PropertyResponse> properties = propertyService.getAllProperties();

    assertNotNull(properties);
    assertEquals(1, properties.size());
  }
}
