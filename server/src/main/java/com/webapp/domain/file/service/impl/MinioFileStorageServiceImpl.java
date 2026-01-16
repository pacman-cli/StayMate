package com.webapp.domain.file.service.impl;

import java.io.InputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.webapp.domain.file.service.FileStorageService;

import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.SetBucketPolicyArgs;
import jakarta.annotation.PostConstruct;

@Service
public class MinioFileStorageServiceImpl implements FileStorageService {

  private final MinioClient minioClient;

  @Value("${minio.bucket-name}")
  private String bucketName;

  @Value("${minio.url}")
  private String minioUrl;

  @Value("${minio.public-url}")
  private String minioPublicUrl;

  public MinioFileStorageServiceImpl(MinioClient minioClient) {
    this.minioClient = minioClient;
  }

  @PostConstruct
  public void init() {
    // Creates a bucket if missing and sets public read policy
    try {
      boolean found = minioClient.bucketExists(
          BucketExistsArgs.builder()
              .bucket(bucketName)
              .build());
      if (!found) {
        minioClient.makeBucket(
            MakeBucketArgs.builder()
                .bucket(bucketName)
                .build());

        // Set bucket policy to allow public read access
        String policy = """
            {
              "Version": "2012-10-17",
              "Statement": [
                {
                  "Effect": "Allow",
                  "Principal": "*",
                  "Action": ["s3:GetObject"],
                  "Resource": ["arn:aws:s3:::%s/*"]
                }
              ]
            }
            """.formatted(bucketName);

        minioClient.setBucketPolicy(
            SetBucketPolicyArgs.builder()
                .bucket(bucketName)
                .config(policy)
                .build());
      }
    } catch (Exception e) {
      throw new RuntimeException("Could not initialize MinIO bucket", e);
    }
  }

  /**
   * Stores file; returns full accessible URL
   */
  @Override
  public String storeFile(MultipartFile file) {
    String originalFileName = file.getOriginalFilename();
    if (originalFileName == null) {
      throw new RuntimeException("File name cannot be null");
    }
    String cleanFileName = StringUtils.cleanPath(originalFileName);
    String fileExtension = "";

    int i = cleanFileName.lastIndexOf('.');
    if (i > 0) {
      fileExtension = cleanFileName.substring(i); // Extract the file extension
    }

    String newFileName = UUID.randomUUID().toString() + fileExtension;

    try {
      InputStream inputStream = file.getInputStream();
      minioClient.putObject(
          // Stores a file in bucket with content type
          PutObjectArgs.builder()
              .bucket(bucketName)
              .object(newFileName)
              .stream(inputStream, file.getSize(), -1)
              .contentType(file.getContentType())
              .build());

      // Return full accessible URL
      // Use clean path construction
      return (minioPublicUrl.endsWith("/") ? minioPublicUrl : minioPublicUrl + "/") +
          bucketName + "/" + newFileName;
    } catch (Exception ex) {
      throw new RuntimeException("Could not store file " + cleanFileName + ". Please try again!", ex);
    }
  }

  @Override
  public Resource loadFileAsResource(String fileName) {
    // Loads file as resource; throws on failure
    try {
      InputStream stream = minioClient.getObject(
          GetObjectArgs.builder()
              .bucket(bucketName)
              .object(fileName)
              .build());

      return new InputStreamResource(stream);
    } catch (Exception ex) {
      throw new RuntimeException("File not found " + fileName, ex);
    }
  }

  @Override
  public long getFileSize(String fileName) {
    try {
      return minioClient.statObject(
          io.minio.StatObjectArgs.builder()
              .bucket(bucketName)
              .object(fileName)
              .build())
          .size();
    } catch (Exception ex) {
      throw new RuntimeException("Could not get file size for " + fileName, ex);
    }
  }
}
