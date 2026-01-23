package com.webapp.domain.admin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.auth.exception.ResourceNotFoundException;
import com.webapp.domain.admin.entity.CMSContent;
import com.webapp.domain.admin.enums.CMSContentType;
import com.webapp.domain.admin.repository.CMSContentRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/cms")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "CMS Content", description = "Admin endpoints for managing CMS content")
public class CmsContentController {

  private final CMSContentRepository cmsRepository;

  @GetMapping
  @Operation(summary = "Get all CMS content entries")
  public ResponseEntity<List<CMSContent>> getAllContent() {
    return ResponseEntity.ok(cmsRepository.findAll());
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get CMS content by ID")
  public ResponseEntity<CMSContent> getContentById(@PathVariable Long id) {
    CMSContent content = cmsRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("CMS content not found"));
    return ResponseEntity.ok(content);
  }

  @GetMapping("/key/{key}")
  @Operation(summary = "Get CMS content by key")
  public ResponseEntity<CMSContent> getContentByKey(@PathVariable String key) {
    CMSContent content = cmsRepository.findByKey(key)
        .orElseThrow(() -> new ResourceNotFoundException("CMS content not found for key: " + key));
    return ResponseEntity.ok(content);
  }

  @PostMapping
  @Operation(summary = "Create new CMS content entry")
  public ResponseEntity<CMSContent> createContent(@Valid @RequestBody CmsRequest request) {
    if (cmsRepository.findByKey(request.getKey()).isPresent()) {
      throw new IllegalArgumentException("Content with key '" + request.getKey() + "' already exists");
    }

    CMSContent content = CMSContent.builder()
        .key(request.getKey())
        .type(request.getType())
        .title(request.getTitle())
        .content(request.getContent())
        .active(request.isActive())
        .build();

    CMSContent saved = cmsRepository.save(content);
    log.info("Created CMS content with key: {}", saved.getKey());

    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update CMS content entry")
  public ResponseEntity<CMSContent> updateContent(
      @PathVariable Long id,
      @Valid @RequestBody CmsRequest request) {

    CMSContent content = cmsRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("CMS content not found"));

    content.setTitle(request.getTitle());
    content.setContent(request.getContent());
    content.setType(request.getType());
    content.setActive(request.isActive());

    CMSContent updated = cmsRepository.save(content);
    log.info("Updated CMS content: {}", updated.getKey());

    return ResponseEntity.ok(updated);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete CMS content entry")
  public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
    if (!cmsRepository.existsById(id)) {
      throw new ResourceNotFoundException("CMS content not found");
    }

    cmsRepository.deleteById(id);
    log.info("Deleted CMS content with id: {}", id);

    return ResponseEntity.noContent().build();
  }

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class CmsRequest {
    private String key;
    private CMSContentType type;
    private String title;
    private String content;
    @Builder.Default
    private boolean active = true;
  }
}
