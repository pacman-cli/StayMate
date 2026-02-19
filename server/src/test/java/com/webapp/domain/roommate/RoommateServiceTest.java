package com.webapp.domain.roommate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.service.UserService;
import com.webapp.domain.verification.service.VerificationService;

public class RoommateServiceTest {

  @Mock
  private RoommatePostRepository roommatePostRepository;

  @Mock
  private UserService userService;

  @Mock
  private VerificationService verificationService;

  @InjectMocks
  private RoommateService roommateService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void createPost_Success() {
    // Arrange
    Long userId = 1L;
    User user = User.builder().id(userId).firstName("John").lastName("Doe").build();

    RoommatePostDto request = RoommatePostDto.builder()
        .location("New York")
        .budget(1000.0)
        .moveInDate(LocalDate.now().plusDays(10))
        .bio("Hello")
        .genderPreference("ANY")
        .smoking(false)
        .pets(false)
        .occupation("STUDENT")
        .build();

    RoommatePost savedPost = RoommatePost.builder()
        .id(100L)
        .user(user)
        .location("New York")
        .budget(1000.0)
        .moveInDate(LocalDate.now().plusDays(10))
        .bio("Hello")
        .genderPreference("ANY")
        .smoking(false)
        .pets(false)
        .occupation("STUDENT")
        .status(RoommatePostStatus.PENDING)
        .createdAt(java.time.LocalDateTime.now())
        .build();

    when(userService.getUserById(userId)).thenReturn(user);
    when(roommatePostRepository.save(any(RoommatePost.class))).thenReturn(savedPost);

    // Act
    RoommatePostDto result = roommateService.createPost(userId, request);

    // Assert
    assertNotNull(result);
    assertEquals(savedPost.getId(), result.getId());
    assertEquals("New York", result.getLocation());
    assertEquals(1000.0, result.getBudget());
    verify(userService).getUserById(userId);
    verify(roommatePostRepository).save(any(RoommatePost.class));
  }
}
