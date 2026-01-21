package com.webapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class MinioConfig {

  @Value("${minio.url}")
  private String minioUrl;

  @Value("${minio.access-key}")
  private String accessKey;

  @Value("${minio.secret-key}")
  private String secretKey;

  @Bean
  @ConditionalOnProperty(name = "minio.url")
  public MinioClient minioClient() {
    log.info("Initializing MinIO client with endpoint: {}", minioUrl);
    try {
      MinioClient client = MinioClient.builder()
          .endpoint(minioUrl)
          .credentials(accessKey, secretKey)
          .build();
      log.info("MinIO client initialized successfully");
      return client;
    } catch (Exception e) {
      log.error("Failed to initialize MinIO client: {}", e.getMessage());
      throw new RuntimeException("Could not initialize MinIO client", e);
    }
  }
}
