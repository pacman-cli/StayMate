package com.webapp.domain.roommate;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.ai.service.AiService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.service.UserService;
import com.webapp.domain.verification.service.VerificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class RoommateService {

  private final RoommatePostRepository roommatePostRepository;
  private final UserService userService;
  private final VerificationService verificationService;
  private final AiService aiService;

  @Transactional(readOnly = true)
  public RoommatePostDto getPostById(@NonNull Long id, Long currentUserId) {
    RoommatePost post = roommatePostRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Post not found"));
    RoommatePostDto dto = mapToDto(post);

    if (currentUserId != null && !post.getUser().getId().equals(currentUserId)) {
      List<RoommatePost> myPosts = roommatePostRepository.findByUserId(currentUserId);
      if (!myPosts.isEmpty()) {
        dto.setMatchScore(calculateMatchScore(myPosts.get(0), post));
      }
    }
    return dto;
  }

  @Transactional
  public RoommatePostDto createPost(@NonNull Long userId, RoommatePostDto request) {
    // Enforce 100% Verification
    verificationService.validateUserVerification(userId);

    User user = userService.getUserById(userId);

    RoommatePost post = RoommatePost.builder()
        .user(user)
        .location(request.getLocation())
        .budget(request.getBudget())
        .moveInDate(request.getMoveInDate())
        .bio(request.getBio())
        .genderPreference(request.getGenderPreference())
        .smoking(request.getSmoking())
        .pets(request.getPets())
        .occupation(request.getOccupation())
        .latitude(request.getLatitude())
        .latitude(request.getLatitude())
        .longitude(request.getLongitude())
        .cleanliness(request.getCleanliness())
        .sleepSchedule(request.getSleepSchedule())
        .personalityTags(request.getPersonalityTags())
        .interests(request.getInterests())
        .status(RoommatePostStatus.APPROVED) // Requires Admin Approval
        .build();

    RoommatePost savedPost = roommatePostRepository.save(post);
    return mapToDto(savedPost);
  }

  public List<RoommatePostDto> searchPosts(Long currentUserId, String location, Double minBudget, Double maxBudget,
      String genderPreference) {
    List<RoommatePost> posts = roommatePostRepository.searchPosts(location, minBudget, maxBudget, genderPreference);

    // If no user is logged in, just return raw results
    if (currentUserId == null) {
      return posts.stream()
          .map(this::mapToDto)
          .collect(Collectors.toList());
    }

    // Get current user's post preferences for matching
    List<RoommatePost> myPosts = roommatePostRepository.findByUserId(currentUserId);
    RoommatePost myPost = myPosts.isEmpty() ? null : myPosts.get(0);

    return posts.stream()
        .filter(post -> currentUserId == null || !post.getUser().getId().equals(currentUserId)) // Fix: Exclude own
                                                                                                // posts
        .map(post -> {
          RoommatePostDto dto = mapToDto(post);
          // Calculate score if we have a baseline and it's not our own post
          if (myPost != null && !post.getUser().getId().equals(currentUserId)) {
            dto.setMatchScore(calculateMatchScore(myPost, post));
          }
          return dto;
        })
        .sorted((p1, p2) -> {
          // Sort by match score descending, nulls last
          if (p1.getMatchScore() == null && p2.getMatchScore() == null)
            return 0;
          if (p1.getMatchScore() == null)
            return 1;
          if (p2.getMatchScore() == null)
            return -1;
          return p2.getMatchScore().compareTo(p1.getMatchScore());
        })
        .collect(Collectors.toList());
  }

  public List<RoommatePostDto> getMyPosts(@NonNull Long userId) {
    return roommatePostRepository.findByUserId(userId)
        .stream()
        .map(this::mapToDto)
        .collect(Collectors.toList());
  }

  @Transactional
  public RoommatePostDto updatePost(@NonNull Long userId, @NonNull Long postId, RoommatePostDto request) {
    RoommatePost post = roommatePostRepository.findById(postId)
        .orElseThrow(() -> new RuntimeException("Post not found"));

    if (post.getUser() == null || post.getUser().getId() == null || !post.getUser().getId().equals(userId)) {
      throw new RuntimeException("Unauthorized to update this post");
    }

    post.setLocation(request.getLocation());
    post.setBudget(request.getBudget());
    post.setMoveInDate(request.getMoveInDate());
    post.setBio(request.getBio());
    post.setGenderPreference(request.getGenderPreference());
    post.setSmoking(request.getSmoking());
    post.setPets(request.getPets());
    post.setOccupation(request.getOccupation());
    post.setCleanliness(request.getCleanliness());
    post.setSleepSchedule(request.getSleepSchedule());
    post.setPersonalityTags(request.getPersonalityTags());
    post.setInterests(request.getInterests());

    return mapToDto(roommatePostRepository.save(post));
  }

  @Transactional
  public void deletePost(@NonNull Long userId, @NonNull Long postId) {
    RoommatePost post = roommatePostRepository.findById(postId)
        .orElseThrow(() -> new RuntimeException("Post not found"));

    if (post.getUser() == null || post.getUser().getId() == null || !post.getUser().getId().equals(userId)) {
      throw new RuntimeException("Unauthorized to delete this post");
    }

    roommatePostRepository.delete(post);
  }

  @Transactional
  public RoommatePostDto updateStatus(@NonNull Long id, RoommatePostStatus status) {
    RoommatePost post = roommatePostRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Post not found"));
    post.setStatus(status);
    return mapToDto(roommatePostRepository.save(post));
  }

  @Transactional(readOnly = true)
  public List<RoommatePostDto> getAllPosts() {
    return roommatePostRepository.findAllWithUser().stream()
        .map(this::mapToDto)
        .collect(Collectors.toList());
  }

  private RoommatePostDto mapToDto(RoommatePost post) {
    User user = post.getUser();
    String userName = user != null
        ? (user.getFirstName() + " " + user.getLastName()).trim()
        : "Unknown User";
    String userAvatar = user != null ? user.getProfilePictureUrl() : null;

    return RoommatePostDto.builder()
        .id(post.getId())
        .userId(user != null ? user.getId() : null)
        .userName(userName)
        .userAvatar(userAvatar)
        .location(post.getLocation())
        .budget(post.getBudget())
        .moveInDate(post.getMoveInDate())
        .bio(post.getBio())
        .genderPreference(post.getGenderPreference())
        .smoking(post.getSmoking())
        .pets(post.getPets())
        .occupation(post.getOccupation())
        .cleanliness(post.getCleanliness())
        .sleepSchedule(post.getSleepSchedule())
        .personalityTags(post.getPersonalityTags())
        .interests(post.getInterests())
        .latitude(post.getLatitude())
        .longitude(post.getLongitude())
        .status(post.getStatus())
        .createdAt(post.getCreatedAt() != null ? post.getCreatedAt().toString() : null)
        .build();
  }

  @Transactional(readOnly = true)
  public List<RoommatePostDto> getMatches(@NonNull Long userId) {
    // 1. Get current user's post preferences
    List<RoommatePost> myPosts = roommatePostRepository.findByUserId(userId);

    // 2. Get all other active posts
    List<RoommatePost> allPosts = roommatePostRepository.findAllWithUser();
    log.info("Total posts in DB: {}", allPosts.size());

    if (myPosts.isEmpty()) {
      log.warn("User {} has no roommate post. Returning all posts without compatibility score.", userId);
      return allPosts.stream()
          .filter(post -> !post.getUser().getId().equals(userId))
          .filter(
              post -> post.getStatus() == RoommatePostStatus.APPROVED || post.getStatus() == RoommatePostStatus.PENDING)
          .map(this::mapToDto)
          .collect(Collectors.toList());
    }
    RoommatePost myPost = myPosts.get(0); // Assume primary post
    log.info("User {} has post ID: {}, Status: {}", userId, myPost.getId(), myPost.getStatus());

    // 3. Score and Filter
    log.info("Finding matches for user ID: {}", userId);
    List<RoommatePostDto> matches = allPosts.stream()
        .filter(post -> !post.getUser().getId().equals(userId)) // Exclude self
        .filter(
            post -> post.getStatus() == RoommatePostStatus.APPROVED || post.getStatus() == RoommatePostStatus.PENDING)
        .map(post -> {
          int score = calculateMatchScore(myPost, post);
          // log.debug("Scored post {}: {}", post.getId(), score);
          return new java.util.AbstractMap.SimpleEntry<>(post, score);
        })
        .sorted((e1, e2) -> Integer.compare(e2.getValue(), e1.getValue())) // Sort by score desc
        .map(entry -> {
          RoommatePostDto dto = mapToDto(entry.getKey());
          dto.setMatchScore(entry.getValue()); // Ensure DTO has this field or add it
          return dto;
        })
        .collect(Collectors.toList());

    log.info("Found {} matches for user ID: {}", matches.size(), userId);

    // 4. Enrich Top 3 Matches with AI Explanation (if available)
    boolean aiHealthy = aiService.checkHealth();
    log.info("AI Service Health: {}", aiHealthy);

    if (!matches.isEmpty() && aiHealthy) {
      matches.stream().limit(3).forEach(match -> {
        try {
          String explanation = generateAiExplanation(myPost, match);
          log.info("Generated AI explanation for match {}: {}", match.getId(), explanation);
          match.setMatchExplanation(explanation);
        } catch (Exception e) {
          log.error("AI Explanation failed for match {}", match.getId(), e);
        }
      });
    } else {
      log.warn("Skipping AI explanation. Matches: {}, AI Healthy: {}", matches.size(), aiHealthy);
    }

    return matches;
  }

  private String generateAiExplanation(RoommatePost myPost, RoommatePostDto match) {
    String prompt = String.format("""
        Analyze roommate compatibility for:
        Me: Budget $%s, Loc %s, Clean %s, Sleep %s, Bio: %s
        Candidate: Budget $%s, Loc %s, Clean %s, Sleep %s, Bio: %s

        Explain why we match in 1 sentence. Start with "You match because..."
        """,
        myPost.getBudget(), myPost.getLocation(), myPost.getCleanliness(), myPost.getSleepSchedule(), myPost.getBio(),
        match.getBudget(), match.getLocation(), match.getCleanliness(), match.getSleepSchedule(), match.getBio());

    String response = aiService.generateResponse(prompt);
    // Cleanup quotes if present
    if (response != null) {
      return response.replaceAll("\"", "").trim();
    }
    return null;
  }

  private int calculateMatchScore(RoommatePost myPost, RoommatePost otherPost) {
    int score = 0;

    // 1. Budget & Location (40% - Core Essentials)
    // ---------------------------------------------------------
    // Location: 20 points
    if (myPost.getLocation() != null && otherPost.getLocation() != null &&
        (myPost.getLocation().toLowerCase().contains(otherPost.getLocation().toLowerCase()) ||
            otherPost.getLocation().toLowerCase().contains(myPost.getLocation().toLowerCase()))) {
      score += 20;
    }

    // Budget: 20 points
    if (myPost.getBudget() != null && otherPost.getBudget() != null) {
      double diff = Math.abs(myPost.getBudget() - otherPost.getBudget());
      if (diff <= 200)
        score += 20; // Perfect match
      else if (diff <= 500)
        score += 10; // Acceptable range
      else if (diff <= 1000)
        score += 5;
    }

    // 2. Habits (25% - Daily Living)
    // ---------------------------------------------------------
    // Cleanliness: 15 points
    if (myPost.getCleanliness() != null && otherPost.getCleanliness() != null) {
      if (myPost.getCleanliness() == otherPost.getCleanliness()) {
        score += 15;
      } else if (isCleanlinessCompatible(myPost.getCleanliness(), otherPost.getCleanliness())) {
        score += 10; // Compatible (e.g. Moderate <-> Neat)
      }
    }

    // Sleep Schedule: 10 points
    if (myPost.getSleepSchedule() != null && otherPost.getSleepSchedule() != null) {
      if (myPost.getSleepSchedule() == otherPost.getSleepSchedule()) {
        score += 10;
      } else if (isSleepCompatible(myPost.getSleepSchedule(), otherPost.getSleepSchedule())) {
        score += 5; // Compatible (e.g. Irregular can adapt)
      }
    }

    // 3. Lifestyle (20% - Deal Breakers)
    // ---------------------------------------------------------
    // Smoking: 10 points
    if (objEquals(myPost.getSmoking(), otherPost.getSmoking()))
      score += 10;

    // Pets: 10 points
    if (objEquals(myPost.getPets(), otherPost.getPets()))
      score += 10;

    // 4. Personality & Interests (15% - Vibe Check)
    // ---------------------------------------------------------
    score += calculateInterestOverlap(myPost.getInterests(), otherPost.getInterests(), 15);

    return Math.min(score, 100); // Cap at 100%
  }

  // --- Helper Methods for AI Matching ---

  private boolean isCleanlinessCompatible(CleanlinessLevel c1, CleanlinessLevel c2) {
    // Moderate is compatible with anyone, really opposites (Messy vs Neat) are the
    // issue
    if (c1 == CleanlinessLevel.MODERATE || c2 == CleanlinessLevel.MODERATE)
      return true;
    return false; // Messy vs Neat Freak = Start of a horror movie
  }

  private boolean isSleepCompatible(SleepSchedule s1, SleepSchedule s2) {
    // Irregular is the wildcard
    if (s1 == SleepSchedule.IRREGULAR || s2 == SleepSchedule.IRREGULAR)
      return true;
    return false; // Early Bird vs Night Owl = Conflict
  }

  private boolean objEquals(Object o1, Object o2) {
    if (o1 == null && o2 == null)
      return true; // Both don't care = match
    if (o1 == null || o2 == null)
      return false;
    return o1.equals(o2);
  }

  private int calculateInterestOverlap(List<String> list1, List<String> list2, int maxPoints) {
    if (list1 == null || list2 == null || list1.isEmpty() || list2.isEmpty())
      return 0;

    // Convert to lowercase for loose matching
    List<String> l1 = list1.stream().map(String::toLowerCase).collect(Collectors.toList());
    List<String> l2 = list2.stream().map(String::toLowerCase).collect(Collectors.toList());

    long matches = l1.stream().filter(l2::contains).count();

    // If they share at least 3 interests, full points. 1 interest = 1/3 points.
    if (matches >= 3)
      return maxPoints;
    return (int) ((matches / 3.0) * maxPoints);
  }
}
