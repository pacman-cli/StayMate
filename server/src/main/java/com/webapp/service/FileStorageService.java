package com.webapp.service;

import java.io.InputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import jakarta.annotation.PostConstruct;

@Service
public class FileStorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    public FileStorageService(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    @PostConstruct
    public void init() {
        // Creates a bucket if missing; throws on failure
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
            }
        } catch (Exception e) {
            throw new RuntimeException("Could not initialize MinIO bucket", e);
        }
    }

    /**
     * Stores file; returns unique name; handles exceptions
     */
    public String storeFile(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            throw new RuntimeException("File name cannot be null");
        }
        String cleanFileName = StringUtils.cleanPath(originalFileName);
        String fileExtension = "";

        int i = cleanFileName.lastIndexOf('.');
        if (i > 0) {
            fileExtension = cleanFileName.substring(i); //Extract the file extension
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
            return newFileName;
        } catch (Exception ex) {
            throw new RuntimeException("Could not store file " + cleanFileName + ". Please try again!", ex);
        }
    }

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
}
