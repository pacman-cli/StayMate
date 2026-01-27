package com.webapp.domain.file.service.impl;

import java.io.InputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
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
import lombok.extern.slf4j.Slf4j;

@Service
@Primary
@Slf4j
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
        // Creates a bucket if missing and ALWAYS sets public read policy and CORS
        try {
            boolean found = minioClient.bucketExists(
                    BucketExistsArgs.builder()
                            .bucket(bucketName)
                            .build());
            // Creates bucket if missing
            if (!found) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(bucketName)
                                .build());
                log.info("Created MinIO bucket: {}", bucketName);
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

            minioClient.setBucketPolicy(
                    SetBucketPolicyArgs.builder()
                            .bucket(bucketName)
                            .config(policy)
                            .build());
            log.info("Set public read policy on bucket: {}", bucketName);

            // Note: CORS configuration removed due to dependency issues.
            // Please configure CORS manually via MinIO Console or CLI if needed for direct
            // browser access.
            // setBucketCors logic requires MinIO SDK compatibility which seems inconsistent
            // here.

        } catch (Exception e) {
            log.error("Failed to initialize MinIO bucket: {}", e.getMessage());
            // Don't throw exception here to allow app to start even if MinIO is temporarily
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
            minioClient.putObject(
                    // Stores a file in bucket with content type
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(newFileName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build());

            // Return full accessible URL
            // Ensure no double slashes
            String baseUrl = minioPublicUrl.endsWith("/") ? minioPublicUrl : minioPublicUrl + "/";
            return baseUrl + bucketName + "/" + newFileName;
        } catch (Exception ex) {
            throw new RuntimeException("Could not store file " + cleanFileName + ". Please try again!", ex);
        }
    }

    @Override
    public Resource loadFileAsResource(String fileName) {
        // Loads file as resource; throws on failure
        try {
            String objectName = fileName;
            // logic to handle if bucket name is prefixed (compatibility with
            // PublicFileController)
            if (fileName.startsWith(bucketName + "/")) {
                objectName = fileName.substring(bucketName.length() + 1);
            }

            InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
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

            return minioClient.statObject(
                    io.minio.StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build())
                    .size();
        } catch (Exception ex) {
            throw new RuntimeException("Could not get file size for " + fileName, ex);
        }
    }
}
