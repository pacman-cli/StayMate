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

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/uploads")
public class FileController {

  private final FileStorageService fileStorageService;

  public FileController(FileStorageService fileStorageService) {
    this.fileStorageService = fileStorageService;
  }

  @GetMapping("/{fileName:.+}")
  public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
    Resource resource = fileStorageService.loadFileAsResource(fileName);

    String contentType = null;
    try {
      contentType = request.getServletContext().getMimeType(fileName);
    } catch (Exception ex) {
      // logger.info("Could not determine file type.");
    }

    if (contentType == null) {
      contentType = "application/octet-stream";
    }

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
        .body(resource);
  }
}
