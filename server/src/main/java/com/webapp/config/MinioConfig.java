package com.webapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;

@Configuration
@ConditionalOnProperty(name = "minio.enabled", havingValue = "true", matchIfMissing = true)
@Slf4j
public class MinioConfig {

  @Value("${minio.url}")
  private String minioUrl;

  @Value("${minio.access-key}")
  private String accessKey;

  @Value("${minio.secret-key}")
  private String secretKey;

  @Value("${minio.region:}")
  private String region;

  @Bean
  public MinioClient minioClient() {
    log.info("Initializing MinIO client with endpoint: {}", minioUrl);
    try {
      // MinIO SDK strictly rejects URLs that contain paths (like Supabase's
      // /storage/v1/s3)
      // We must extract only the scheme and authority (e.g. https://xyz.supabase.co)
      String baseUrl = minioUrl;
      if (minioUrl != null && minioUrl.contains("supabase.co")) {
        java.net.URL url = new java.net.URL(minioUrl);
        baseUrl = url.getProtocol() + "://" + url.getAuthority();
        log.info("Parsed base URL for MinIO: {}", baseUrl);
      }

      io.minio.MinioClient.Builder builder = MinioClient.builder()
          .endpoint(baseUrl)
          .credentials(accessKey, secretKey);

      if (region != null && !region.trim().isEmpty()) {
        builder.region(region);
      }

      MinioClient client = builder.build();
      log.info("MinIO client initialized successfully");
      return client;
    } catch (Exception e) {
      log.error("Failed to initialize MinIO client: {}", e.getMessage());
      throw new RuntimeException("Could not initialize MinIO client", e);
    }
  }
}
