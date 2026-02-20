package com.webapp.domain.file.service.impl;

import java.io.InputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.webapp.domain.file.service.FileStorageService;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.BucketAlreadyExistsException;
import software.amazon.awssdk.services.s3.model.BucketAlreadyOwnedByYouException;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.PutBucketPolicyRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@Primary
@ConditionalOnProperty(name = "minio.enabled", havingValue = "true", matchIfMissing = true)
@Slf4j
public class S3FileStorageServiceImpl implements FileStorageService {

  private final S3Client s3Client;

  @Value("${minio.bucket-name}")
  private String bucketName;

  @Value("${minio.public-url}")
  private String minioPublicUrl;

  public S3FileStorageServiceImpl(S3Client s3Client) {
    this.s3Client = s3Client;
  }

  @PostConstruct
  public void init() {
    // Creates a bucket if missing and ALWAYS sets public read policy
    try {
      log.info("Checking if S3 bucket exists: {}", bucketName);
      try {
        s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
        log.info("Created S3 bucket: {}", bucketName);
      } catch (BucketAlreadyExistsException | BucketAlreadyOwnedByYouException e) {
        log.info("Bucket {} already exists.", bucketName);
      }

      // ALWAYS set bucket policy to ensure public read access
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

      s3Client.putBucketPolicy(PutBucketPolicyRequest.builder()
          .bucket(bucketName)
          .policy(policy)
          .build());
      log.info("Set public read policy on bucket: {}", bucketName);

    } catch (Exception e) {
      log.error("Failed to initialize S3 bucket: {}", e.getMessage());
      // Don't throw exception here to allow app to start even if S3 is temporarily
      // down
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
      long contentLength = file.getSize();

      PutObjectRequest putOb = PutObjectRequest.builder()
          .bucket(bucketName)
          .key(newFileName)
          .contentType(file.getContentType())
          .build();

      s3Client.putObject(putOb, RequestBody.fromInputStream(inputStream, contentLength));

      // Return full accessible URL
      // Ensure no double slashes
      String baseUrl = minioPublicUrl.endsWith("/") ? minioPublicUrl : minioPublicUrl + "/";
      return baseUrl + bucketName + "/" + newFileName;
    } catch (Exception ex) {
      log.error("Failed to store file in S3", ex);
      throw new RuntimeException("Could not store file " + cleanFileName + ". Please try again!", ex);
    }
  }

  @Override
  public Resource loadFileAsResource(String fileName) {
    // Loads file as resource; throws on failure
    try {
      String objectName = fileName;
      // logic to handle if bucket name is prefixed
      if (fileName.startsWith(bucketName + "/")) {
        objectName = fileName.substring(bucketName.length() + 1);
      }

      InputStream stream = s3Client.getObject(GetObjectRequest.builder()
          .bucket(bucketName)
          .key(objectName)
          .build());

      return new InputStreamResource(stream);
    } catch (Exception ex) {
      throw new RuntimeException("File not found " + fileName, ex);
    }
  }

  @Override
  public long getFileSize(String fileName) {
    try {
      String objectName = fileName;
      if (fileName.startsWith(bucketName + "/")) {
        objectName = fileName.substring(bucketName.length() + 1);
      }

      HeadObjectResponse response = s3Client.headObject(HeadObjectRequest.builder()
          .bucket(bucketName)
          .key(objectName)
          .build());

      return response.contentLength();
    } catch (Exception ex) {
      throw new RuntimeException("Could not get file size for " + fileName, ex);
    }
  }
}
