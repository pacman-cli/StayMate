package com.webapp.auth.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.webapp.auth.security.JwtAuthenticationFilter;
import com.webapp.auth.security.MaintenanceModeFilter;
import com.webapp.auth.security.oauth2.CustomOAuth2UserService;
import com.webapp.auth.security.oauth2.HttpCookieOAuth2AuthorizationRequestRepository;
import com.webapp.auth.security.oauth2.OAuth2AuthenticationFailureHandler;
import com.webapp.auth.security.oauth2.OAuth2AuthenticationSuccessHandler;

import lombok.extern.slf4j.Slf4j;

/**
 * Security Configuration for StayMate.
 * Supports Google OAuth2 + JWT authentication.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@Slf4j
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final UserDetailsService userDetailsService;
        private final CustomOAuth2UserService customOAuth2UserService;
        private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
        private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
        private final PasswordEncoder passwordEncoder;
        private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;
        private final RateLimitFilter rateLimitFilter;
        private final MaintenanceModeFilter maintenanceModeFilter;

        @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:8080}")
        private String allowedOriginsConfig;

        public SecurityConfig(
                        @Lazy JwtAuthenticationFilter jwtAuthenticationFilter,
                        @Lazy UserDetailsService userDetailsService,
                        CustomOAuth2UserService customOAuth2UserService,
                        OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler,
                        OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler,
                        PasswordEncoder passwordEncoder,
                        HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository,
                        RateLimitFilter rateLimitFilter,
                        MaintenanceModeFilter maintenanceModeFilter) {
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
                this.userDetailsService = userDetailsService;
                this.customOAuth2UserService = customOAuth2UserService;
                this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
                this.oAuth2AuthenticationFailureHandler = oAuth2AuthenticationFailureHandler;
                this.passwordEncoder = passwordEncoder;
                this.httpCookieOAuth2AuthorizationRequestRepository = httpCookieOAuth2AuthorizationRequestRepository;
                this.rateLimitFilter = rateLimitFilter;
                this.maintenanceModeFilter = maintenanceModeFilter;
        }

        @Bean
        @Primary
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                log.info("Configuring Security Filter Chain with OAuth2...");

                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                // Public endpoints - no authentication required
                                                .requestMatchers(
                                                                "/api/auth/register",
                                                                "/api/auth/login",
                                                                "/api/auth/refresh-token",
                                                                "/api/auth/check-email",
                                                                "/oauth2/**",
                                                                "/login/oauth2/**",
                                                                "/login/**",
                                                                "/api/public/**",
                                                                "/actuator/health",
                                                                "/ws/**",
                                                                "/h2-console/**",
                                                                "/error",
                                                                "/uploads/**",
                                                                "/api/v1/internal/sudo/**",
                                                                "/api/properties/search",
                                                                "/api/properties/recommended",
                                                                "/api/properties/{id:[0-9]+}", // Only allow numeric IDs
                                                                                               // publicly
                                                                "/api/roommates/**",
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/v3/api-docs/**")
                                                .permitAll()
                                                // Admin only endpoints
                                                .requestMatchers("/api/admin/**")
                                                .hasRole("ADMIN")
                                                // House owner endpoints
                                                .requestMatchers("/api/house-owner/**")
                                                .hasAnyRole("HOUSE_OWNER", "ADMIN")
                                                // User endpoints
                                                .requestMatchers("/api/users/**")
                                                .authenticated()
                                                // Auth endpoints requiring authentication
                                                .requestMatchers(
                                                                "/api/auth/me",
                                                                "/api/auth/logout",
                                                                "/api/auth/validate",
                                                                "/api/auth/select-role")
                                                .authenticated()
                                                // All other endpoints require authentication
                                                .anyRequest()
                                                .authenticated())
                                // OAuth2 Login Configuration
                                .oauth2Login(oauth2 -> oauth2
                                                .authorizationEndpoint(authorization -> authorization
                                                                .baseUri("/oauth2/authorization")
                                                                .authorizationRequestRepository(
                                                                                httpCookieOAuth2AuthorizationRequestRepository))
                                                .redirectionEndpoint(redirection -> redirection
                                                                .baseUri("/login/oauth2/code/*"))
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(customOAuth2UserService))
                                                .successHandler(oAuth2AuthenticationSuccessHandler)
                                                .failureHandler(oAuth2AuthenticationFailureHandler))
                                .exceptionHandling(exceptions -> exceptions
                                                .defaultAuthenticationEntryPointFor(
                                                                (request, response, authException) -> {
                                                                        response.sendError(
                                                                                        jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED,
                                                                                        "Unauthorized");
                                                                },
                                                                new org.springframework.security.web.util.matcher.AntPathRequestMatcher(
                                                                                "/api/**")))
                                .authenticationProvider(authenticationProvider())
                                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                                .addFilterAfter(maintenanceModeFilter, UsernamePasswordAuthenticationFilter.class)
                                .headers(headers -> headers.addHeaderWriter((request, response) -> {
                                        response.setHeader("X-Content-Type-Options", "nosniff");
                                        response.setHeader("X-Frame-Options", "SAMEORIGIN");
                                        response.setHeader("X-XSS-Protection", "0");
                                }));

                return http.build();
        }

        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
                authProvider.setUserDetailsService(userDetailsService);
                authProvider.setPasswordEncoder(passwordEncoder);
                return authProvider;
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                List<String> allowedOrigins = Arrays.asList(allowedOriginsConfig.split(","));
                configuration.setAllowedOrigins(allowedOrigins);
                configuration.setAllowedMethods(
                                Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(
                                Arrays.asList(
                                                "Authorization",
                                                "Content-Type",
                                                "X-Requested-With",
                                                "Accept",
                                                "Origin",
                                                "Access-Control-Request-Method",
                                                "Access-Control-Request-Headers",
                                                "X-Admin-Secret"));
                configuration.setExposedHeaders(
                                Arrays.asList(
                                                "Access-Control-Allow-Origin",
                                                "Access-Control-Allow-Credentials",
                                                "Authorization"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
