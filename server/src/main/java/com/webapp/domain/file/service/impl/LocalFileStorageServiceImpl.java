package com.webapp.domain.file.service.impl;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.webapp.domain.file.service.FileStorageService;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class LocalFileStorageServiceImpl implements FileStorageService {

  private final Path fileStorageLocation;

  public LocalFileStorageServiceImpl(@Value("${app.file.upload-dir}") String uploadDir) {
    this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
  }

  @PostConstruct
  public void init() {
    try {
      Files.createDirectories(this.fileStorageLocation);
      log.info("Initialized local file storage at {}", this.fileStorageLocation);
    } catch (Exception ex) {
      throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
    }
  }

  @Override
  public String storeFile(MultipartFile file) {
    String originalFileName = file.getOriginalFilename();
    if (originalFileName == null) {
      throw new RuntimeException("File name cannot be null");
    }
    String cleanFileName = StringUtils.cleanPath(originalFileName);

    try {
      // Check if the file's name contains invalid characters
      if (cleanFileName.contains("..")) {
        throw new RuntimeException("Sorry! Filename contains invalid path sequence " + cleanFileName);
      }

      String fileExtension = "";
      int i = cleanFileName.lastIndexOf('.');
      if (i > 0) {
        fileExtension = cleanFileName.substring(i);
      }

      String newFileName = UUID.randomUUID().toString() + fileExtension;
      Path targetLocation = this.fileStorageLocation.resolve(newFileName);
      Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

      // Generate the file download URI
      // Assuming we configure a resource handler for /uploads/** or similar
      // In a real prod scenario with local storage, this might need an Nginx proxy or
      // similar
      // For now, we point to the backend's static resource handler
      String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
          .path("/uploads/")
          .path(newFileName)
          .toUriString();

      return fileDownloadUri;
    } catch (IOException ex) {
      throw new RuntimeException("Could not store file " + cleanFileName + ". Please try again!", ex);
    }
  }

  @Override
  public Resource loadFileAsResource(String fileName) {
    try {
      Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
      Resource resource = new UrlResource(filePath.toUri());
      if (resource.exists()) {
        return resource;
      } else {
        throw new RuntimeException("File not found " + fileName);
      }
    } catch (MalformedURLException ex) {
      throw new RuntimeException("File not found " + fileName, ex);
    }
  }

  @Override
  public long getFileSize(String fileName) {
    try {
      Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
      return Files.size(filePath);
    } catch (IOException ex) {
      throw new RuntimeException("Could not get file size for " + fileName, ex);
    }
  }
}
