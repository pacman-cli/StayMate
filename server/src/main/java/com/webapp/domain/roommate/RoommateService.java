package com.webapp.domain.roommate;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.ai.service.AiService;
import com.webapp.domain.notification.service.NotificationService;
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
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final NotificationService notificationService;

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

        // Builds roommate post with user‑provided location and budget
        RoommatePost post = RoommatePost.builder()
                .user(user)
                .location(request.getLocation())
                .budgetMin(request.getBudgetMin())
                .budgetMax(request.getBudgetMax())
                .budget(request.getBudgetMax()) // Legacy support
                .moveInDate(request.getMoveInDate())
                .bio(request.getBio())
                .genderPreference(request.getGenderPreference())
                .smoking(request.getSmoking())
                .alcohol(request.getAlcohol())
                .pets(request.getPets())
                .occupation(request.getOccupation())
                .stayDuration(request.getStayDuration())
                .guestsAllowed(request.getGuestsAllowed())
                .cookingHabits(request.getCookingHabits())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .cleanliness(request.getCleanliness())
                .sleepSchedule(request.getSleepSchedule())
                .personalityTags(request.getPersonalityTags())
                .interests(request.getInterests())
                .status(RoommatePostStatus.OPEN) // Default to OPEN
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
                .filter(post -> currentUserId == null || !post.getUser().getId().equals(currentUserId))
                .filter(post -> post.getStatus() == RoommatePostStatus.OPEN) // Only show OPEN posts
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
        post.setBudgetMin(request.getBudgetMin());
        post.setBudgetMax(request.getBudgetMax());
        post.setBudget(request.getBudgetMax());
        post.setMoveInDate(request.getMoveInDate());
        post.setBio(request.getBio());
        post.setGenderPreference(request.getGenderPreference());
        post.setSmoking(request.getSmoking());
        post.setAlcohol(request.getAlcohol());
        post.setPets(request.getPets());
        post.setOccupation(request.getOccupation());
        post.setStayDuration(request.getStayDuration());
        post.setGuestsAllowed(request.getGuestsAllowed());
        post.setCookingHabits(request.getCookingHabits());
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
                .budgetMin(post.getBudgetMin())
                .budgetMax(post.getBudgetMax())
                .budget(post.getBudget())
                .moveInDate(post.getMoveInDate())
                .bio(post.getBio())
                .genderPreference(post.getGenderPreference())
                .smoking(post.getSmoking())
                .alcohol(post.getAlcohol())
                .pets(post.getPets())
                .occupation(post.getOccupation())
                .stayDuration(post.getStayDuration())
                .guestsAllowed(post.getGuestsAllowed())
                .cookingHabits(post.getCookingHabits())
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
                            post -> post.getStatus() == RoommatePostStatus.APPROVED
                                    || post.getStatus() == RoommatePostStatus.OPEN)
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
                        post -> post.getStatus() == RoommatePostStatus.APPROVED
                                || post.getStatus() == RoommatePostStatus.OPEN)
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
                    // If the AI returns a JSON, we could also parse the score from it, but for now
                    // we stick to our rule-based score for reliability
                    // and use AI for the qualitative explanation.
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
        try {
            String prompt = String.format(
                    """
                            You are an expert roommate matcher. Analyze the compatibility of these two profiles and provide a JSON response.

                            Profile A (Me):
                            - BudgetRange: $%.0f - $%.0f
                            - Location: %s
                            - Lifestyle: %s smoking, %s pets, %s alcohol, %s guests
                            - Habits: %s cleanliness, %s sleep
                            - Occupation: %s
                            - Bio: %s

                            Profile B (Candidate):
                            - BudgetRange: $%.0f - $%.0f
                            - Location: %s
                            - Lifestyle: %s smoking, %s pets, %s alcohol, %s guests
                            - Habits: %s cleanliness, %s sleep
                            - Occupation: %s
                            - Bio: %s

                            Output JSON ONLY:
                            {
                              "score": number (0-100),
                              "strengths": ["string", "string"],
                              "concerns": ["string", "string"],
                              "summary": "1 sentence explanation starting with 'You match because...'"
                            }
                            """,
                    myPost.getBudgetMin(), myPost.getBudgetMax(), myPost.getLocation(),
                    myPost.getSmoking(), myPost.getPets(), myPost.getAlcohol(), myPost.getGuestsAllowed(),
                    myPost.getCleanliness(), myPost.getSleepSchedule(), myPost.getOccupation(), myPost.getBio(),
                    match.getBudgetMin(), match.getBudgetMax(), match.getLocation(),
                    match.getSmoking(), match.getPets(), match.getAlcohol(), match.getGuestsAllowed(),
                    match.getCleanliness(), match.getSleepSchedule(), match.getOccupation(), match.getBio());

            String response = aiService.generateResponse(prompt);
            if (response == null)
                return null;

            // Clean up markdown code blocks if present
            response = response.replace("```json", "").replace("```", "").trim();

            com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(response);
            return root.has("summary") ? root.get("summary").asText()
                    : "Compatible match based on lifestyle and budget.";
        } catch (Exception e) {
            log.error("Failed to generate AI explanation", e);
            return null;
        }
    }

    private int calculateMatchScore(RoommatePost myPost, RoommatePost otherPost) {
        int score = 0;

        // 1. Budget & Location (35% - Core Essentials)
        // ---------------------------------------------------------
        // Location: 15 points
        if (myPost.getLocation() != null && otherPost.getLocation() != null &&
                (myPost.getLocation().toLowerCase().contains(otherPost.getLocation().toLowerCase()) ||
                        otherPost.getLocation().toLowerCase().contains(myPost.getLocation().toLowerCase()))) {
            score += 15;
        }

        // Budget: 20 points (Range Overlap)
        if (isBudgetCompatible(myPost, otherPost)) {
            score += 20;
        }

        // 2. Habits (25% - Daily Living)
        // ---------------------------------------------------------
        // Cleanliness: 15 points
        if (myPost.getCleanliness() != null && otherPost.getCleanliness() != null) {
            if (myPost.getCleanliness() == otherPost.getCleanliness()) {
                score += 15;
            } else if (isCleanlinessCompatible(myPost.getCleanliness(), otherPost.getCleanliness())) {
                score += 10;
            }
        }

        // Sleep Schedule: 10 points
        if (myPost.getSleepSchedule() != null && otherPost.getSleepSchedule() != null) {
            if (myPost.getSleepSchedule() == otherPost.getSleepSchedule()) {
                score += 10;
            } else if (isSleepCompatible(myPost.getSleepSchedule(), otherPost.getSleepSchedule())) {
                score += 5;
            }
        }

        // 3. Lifestyle (25% - Deal Breakers)
        // ---------------------------------------------------------
        // Smoking: 5 points
        if (objEquals(myPost.getSmoking(), otherPost.getSmoking()))
            score += 5;

        // Alcohol: 5 points
        if (objEquals(myPost.getAlcohol(), otherPost.getAlcohol()))
            score += 5;

        // Pets: 5 points
        if (objEquals(myPost.getPets(), otherPost.getPets()))
            score += 5;

        // Guests: 5 points
        if (objEquals(myPost.getGuestsAllowed(), otherPost.getGuestsAllowed()))
            score += 5;

        // Cooking: 5 points
        if (objEquals(myPost.getCookingHabits(), otherPost.getCookingHabits()))
            score += 5;

        // 4. Personality & Interests (15% - Vibe Check)
        // ---------------------------------------------------------
        score += calculateInterestOverlap(myPost.getInterests(), otherPost.getInterests(), 15);

        return Math.min(score, 100); // Cap at 100%
    }

    private boolean isBudgetCompatible(RoommatePost p1, RoommatePost p2) {
        if (p1.getBudgetMin() == null || p2.getBudgetMin() == null)
            return false;
        // Check if ranges overlap
        // Range 1: [Min1, Max1], Range 2: [Min2, Max2]
        // Overlap if Max1 >= Min2 AND Max2 >= Min1
        return p1.getBudgetMax() >= p2.getBudgetMin() && p2.getBudgetMax() >= p1.getBudgetMin();
    }

    // --- Helper Methods ---

    private int calculateInterestOverlap(List<String> list1, List<String> list2, int maxPoints) {
        if (list1 == null || list2 == null || list1.isEmpty() || list2.isEmpty())
            return 0;

        List<String> l1 = list1.stream().map(String::toLowerCase).collect(Collectors.toList());
        List<String> l2 = list2.stream().map(String::toLowerCase).collect(Collectors.toList());

        long matches = l1.stream().filter(l2::contains).count();

        if (matches >= 3)
            return maxPoints;
        return (int) ((matches / 3.0) * maxPoints);
    }

    private boolean isCleanlinessCompatible(CleanlinessLevel c1, CleanlinessLevel c2) {
        if (c1 == CleanlinessLevel.MODERATE || c2 == CleanlinessLevel.MODERATE)
            return true;
        return false;
    }

    private boolean isSleepCompatible(SleepSchedule s1, SleepSchedule s2) {
        if (s1 == SleepSchedule.IRREGULAR || s2 == SleepSchedule.IRREGULAR)
            return true;
        return false;
    }

    private boolean objEquals(Object o1, Object o2) {
        if (o1 == null && o2 == null)
            return true;
        if (o1 == null || o2 == null)
            return false;
        return o1.equals(o2);
    }

    // --- Roommate Protocol ---

    private final RoommateRequestRepository roommateRequestRepository;

    @Transactional
    public void sendRoommateRequest(Long requesterId, Long receiverId, String message) {
        if (requesterId.equals(receiverId)) {
            throw new IllegalArgumentException("Cannot request yourself");
        }

        // Check if posts exist
        roommatePostRepository.findByUserId(requesterId).stream().findFirst()
                .orElseThrow(() -> new IllegalArgumentException("You need a roommate post first"));

        RoommatePost targetPost = roommatePostRepository.findByUserId(receiverId).stream().findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Target user has no post"));

        // Check if target post is OPEN
        if (targetPost.getStatus() != RoommatePostStatus.OPEN
                && targetPost.getStatus() != RoommatePostStatus.APPROVED) {
            throw new IllegalStateException("This user is not accepting new requests right now.");
        }

        if (roommateRequestRepository.findExistingRequest(requesterId, receiverId).isPresent()) {
            throw new IllegalStateException("Request already exists");
        }

        User requester = userService.getUserById(requesterId);
        User receiver = userService.getUserById(receiverId);

        RoommateRequest req = RoommateRequest.builder()
                .requester(requester)
                .receiver(receiver)
                .status(RoommateRequestStatus.PENDING)
                .message(message)
                .build();

        roommateRequestRepository.save(req);

        // Send notification to receiver
        try {
            notificationService.createNotificationForUser(
                    receiver.getId(),
                    com.webapp.domain.notification.enums.NotificationType.ROOMMATE_REQUEST,
                    "New Roommate Request",
                    requester.getFullName() + " wants to be your roommate!",
                    "/roommates/requests");
        } catch (Exception e) {
            // Log but don't fail transaction
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }

    @Transactional
    public void respondToRequest(Long userId, Long requestId, boolean accept) {
        RoommateRequest req = roommateRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!req.getReceiver().getId().equals(userId)) {
            throw new SecurityException("Not authorized");
        }

        // Lock the post interaction
        RoommatePost myPost = roommatePostRepository.findByUserId(userId).stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Your roommate post was not found"));

        if (accept) {
            // CRITICAL: Check if Post is still OPEN
            if (myPost.getStatus() != RoommatePostStatus.OPEN && myPost.getStatus() != RoommatePostStatus.APPROVED) {
                throw new IllegalStateException("Cannot accept requests in current state: " + myPost.getStatus());
            }

            req.setStatus(RoommateRequestStatus.ACCEPTED);

            // Update Post State -> PENDING_MATCH
            myPost.setStatus(RoommatePostStatus.PENDING_MATCH);
            myPost.setAcceptedRequest(req);
            roommatePostRepository.save(myPost);

            // Optional: Reject or Lock other requests?
            // For now, we leave them PENDING but they can't be accepted because status is
            // no longer OPEN.

        } else {
            req.setStatus(RoommateRequestStatus.REJECTED);
            roommateRequestRepository.save(req);
        }

        // Notify requester of the decision
        try {
            String title = accept ? "Request Accepted!" : "Request Rejected";
            String messageBody = accept
                    ? "Your roommate request was accepted by " + req.getReceiver().getFullName()
                    : "Your roommate request was declined by " + req.getReceiver().getFullName();

            notificationService.createNotificationForUser(
                    req.getRequester().getId(),
                    com.webapp.domain.notification.enums.NotificationType.ROOMMATE_REQUEST,
                    title,
                    messageBody,
                    "/roommates/" + req.getReceiver().getId()); // Or chat
        } catch (Exception e) {
            log.error("Failed to send response notification", e);
        }
    }

    @Transactional
    public void cancelMatch(Long userId, Long requestId) {
        RoommateRequest req = roommateRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        // Only the receiver (ad owner) can cancel via this flow? Or the requester too?
        // Requirement: Owner cancelling a match.
        if (!req.getReceiver().getId().equals(userId) && !req.getRequester().getId().equals(userId)) {
            throw new SecurityException("Not authorized to cancel this match");
        }

        req.setStatus(RoommateRequestStatus.CANCELLED);
        roommateRequestRepository.save(req);

        // If this was the accepted request, reopen the post
        RoommatePost post = roommatePostRepository.findByUserId(req.getReceiver().getId()).stream().findFirst()
                .orElse(null);
        if (post != null && post.getAcceptedRequest() != null && post.getAcceptedRequest().getId().equals(requestId)) {
            post.setStatus(RoommatePostStatus.OPEN);
            post.setAcceptedRequest(null);
            roommatePostRepository.save(post);
        }
    }

    @Transactional
    public void finalizeMatch(Long userId) {
        RoommatePost post = roommatePostRepository.findByUserId(userId).stream().findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        if (post.getStatus() != RoommatePostStatus.PENDING_MATCH) {
            throw new IllegalStateException("Can only finalize from PENDING_MATCH state");
        }

        post.setStatus(RoommatePostStatus.MATCHED);
        roommatePostRepository.save(post);
    }

    public List<RoommateRequest> getIncomingRequests(Long userId) {
        return roommateRequestRepository.findByReceiverId(userId).stream()
                .filter(req -> req.getStatus() == RoommateRequestStatus.PENDING
                        || req.getStatus() == RoommateRequestStatus.ACCEPTED)
                .collect(Collectors.toList());
    }

    public String getRoommateRequestStatus(Long currentUserId, Long targetUserId) {
        return roommateRequestRepository.findExistingRequest(currentUserId, targetUserId)
                .map(req -> {
                    if (req.getStatus() == RoommateRequestStatus.PENDING) {
                        return req.getRequester().getId().equals(currentUserId) ? "SENT_PENDING" : "RECEIVED_PENDING";
                    }
                    return req.getStatus().name();
                })
                .orElse("NONE");
    }
}
