package com.webapp.domain.file.controller;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.domain.file.service.FileStorageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class PublicFileController {

  private final FileStorageService fileStorageService;

  @GetMapping("/{bucket}/{filename:.+}")
  public ResponseEntity<Resource> getFile(
      @PathVariable String bucket,
      @PathVariable String filename) {

    // We accept bucket in path for compatibility, but our service might just use
    // the filename
    // depending on implementation. MinioFileStorageServiceImpl uses encoded
    // filename or handles it.
    // If the service expects just the filename (because bucket is configured), we
    // might ignore bucket
    // or validate it.
    // Looking at MinioFileStorageServiceImpl.loadFileAsResource(fileName), it takes
    // just the filename.
    // However, the URL structure we want is .../bucket/filename.

    Resource file = fileStorageService.loadFileAsResource(filename);

    // Fetch file size for Content-Length header (crucial for video streaming)
    long fileSize = 0;
    try {
      fileSize = fileStorageService.getFileSize(filename);
    } catch (Exception e) {
      // Log warning or ignore if size cannot be determined, but don't fail the
      // request completely
      // In production, use a logger
      System.err.println("Could not determine file size for " + filename + ": " + e.getMessage());
    }

    String contentType = "application/octet-stream";
    // Simple content type deduction (optional, can be improved)
    if (filename.endsWith(".png"))
      contentType = "image/png";
    else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
      contentType = "image/jpeg";
    else if (filename.endsWith(".webp"))
      contentType = "image/webp";
    else if (filename.endsWith(".mp4"))
      contentType = "video/mp4";

    var responseBuilder = ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600");

    if (fileSize > 0) {
      responseBuilder.contentLength(fileSize);
    }

    return responseBuilder.body(file);
  }
}
