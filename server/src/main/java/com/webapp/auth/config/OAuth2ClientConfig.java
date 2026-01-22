package com.webapp.auth.config;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;

import lombok.extern.slf4j.Slf4j;

/**
 * Configuration for OAuth2 Client Registration.
 *
 * This provides a fallback ClientRegistrationRepository when Google OAuth2
 * is not configured or disabled. This prevents Spring Security from failing
 * to start when GOOGLE_CLIENT_ID is not set.
 *
 * When GOOGLE_CLIENT_ID is set to a real value (not empty or "disabled"),
 * Spring Boot auto-configuration will create the proper repository
 * automatically.
 */
@Configuration
@Slf4j
public class OAuth2ClientConfig {

  @Value("${spring.security.oauth2.client.registration.google.client-id:}")
  private String googleClientId;

  /**
   * Provides a fallback ClientRegistrationRepository when OAuth2 is not
   * configured.
   * This bean is only created if no other ClientRegistrationRepository exists.
   *
   * When Google OAuth2 is properly configured, Spring Boot auto-configuration
   * will create the real repository and this bean will not be used.
   */
  @Bean
  @ConditionalOnMissingBean(ClientRegistrationRepository.class)
  public ClientRegistrationRepository clientRegistrationRepository() {
    log.warn("Creating fallback ClientRegistrationRepository - OAuth2 login is DISABLED");
    log.warn("To enable Google login, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables");

    // Create a dummy registration that won't actually work but satisfies Spring
    // Security
    ClientRegistration dummyRegistration = ClientRegistration.withRegistrationId("disabled")
        .clientId("disabled")
        .clientSecret("disabled")
        .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
        .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
        .authorizationUri("https://disabled.local/oauth2/authorize")
        .tokenUri("https://disabled.local/oauth2/token")
        .userInfoUri("https://disabled.local/oauth2/userinfo")
        .userNameAttributeName("sub")
        .clientName("Disabled OAuth2")
        .build();

    return new InMemoryClientRegistrationRepository(Collections.singletonList(dummyRegistration));
  }

  /**
   * Check if OAuth2 is actually configured with real credentials.
   */
  public boolean isOAuth2Enabled() {
    return googleClientId != null
        && !googleClientId.isEmpty()
        && !googleClientId.equals("disabled")
        && !googleClientId.equals("${GOOGLE_CLIENT_ID}");
  }
}
