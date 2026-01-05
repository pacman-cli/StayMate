package com.webapp.domain.roommate;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.auth.security.UserPrincipal;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/roommates")
@RequiredArgsConstructor
public class RoommateController {

  private final RoommateService roommateService;

  @PostMapping
  public ResponseEntity<RoommatePostDto> createPost(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @jakarta.validation.Valid @RequestBody RoommatePostDto request) {
    return ResponseEntity.ok(roommateService.createPost(userPrincipal.getId(), request));
  }

  @GetMapping("/{id}")
  public ResponseEntity<RoommatePostDto> getPostById(@PathVariable Long id) {
    return ResponseEntity.ok(roommateService.getPostById(id));
  }

  @GetMapping
  public ResponseEntity<List<RoommatePostDto>> searchPosts(
      @RequestParam(required = false) String location,
      @RequestParam(required = false) Double minBudget,
      @RequestParam(required = false) Double maxBudget,
      @RequestParam(required = false) String genderPreference) {
    return ResponseEntity.ok(roommateService.searchPosts(location, minBudget, maxBudget, genderPreference));
  }

  @GetMapping("/my")
  public ResponseEntity<List<RoommatePostDto>> getMyPosts(
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ResponseEntity.ok(roommateService.getMyPosts(userPrincipal.getId()));
  }

  @GetMapping("/matches")
  public ResponseEntity<List<RoommatePostDto>> getMatches(
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ResponseEntity.ok(roommateService.getMatches(userPrincipal.getId()));
  }

  @PutMapping("/{id}")
  public ResponseEntity<RoommatePostDto> updatePost(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @PathVariable Long id,
      @RequestBody RoommatePostDto request) {
    return ResponseEntity.ok(roommateService.updatePost(userPrincipal.getId(), id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletePost(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @PathVariable Long id) {
    roommateService.deletePost(userPrincipal.getId(), id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/all")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<List<RoommatePostDto>> getAllPostsAdmin() {
    return ResponseEntity.ok(roommateService.getAllPosts());
  }

  @PutMapping("/{id}/status")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<RoommatePostDto> updateStatus(
      @PathVariable Long id,
      @RequestParam RoommatePostStatus status) {
    return ResponseEntity.ok(roommateService.updateStatus(id, status));
  }
}
