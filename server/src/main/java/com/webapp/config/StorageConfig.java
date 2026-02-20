package com.webapp.config;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

@Configuration
@ConditionalOnProperty(name = "minio.enabled", havingValue = "true", matchIfMissing = true)
@Slf4j
public class StorageConfig {

  @Value("${minio.url}")
  private String minioUrl;

  @Value("${minio.access-key}")
  private String accessKey;

  @Value("${minio.secret-key}")
  private String secretKey;

  @Value("${minio.region:us-east-1}")
  private String region;

  @Bean
  public S3Client s3Client() {
    log.info("Initializing S3 client (AWS SDK v2) with endpoint: {}", minioUrl);
    try {
      Region awsRegion = Region.of(region != null && !region.trim().isEmpty() ? region : "us-east-1");

      return S3Client.builder()
          .region(awsRegion)
          .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
          .endpointOverride(URI.create(minioUrl))
          // CRITICAL: Supabase requires path-style access (e.g.
          // https://.../storage/v1/s3/<bucket>)
          // Traditional AWS S3 uses virtual host style (e.g.
          // https://<bucket>.s3.amazonaws.com)
          .serviceConfiguration(S3Configuration.builder()
              .pathStyleAccessEnabled(true)
              .build())
          .build();
    } catch (Exception e) {
      log.error("Failed to initialize S3 client: {}", e.getMessage());
      throw new RuntimeException("Could not initialize S3 client", e);
    }
  }
}
