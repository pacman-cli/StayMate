package com.webapp.auth.config;

import com.webapp.auth.security.JwtAuthenticationFilter;
import com.webapp.auth.security.oauth2.CustomOAuth2UserService;
import com.webapp.auth.security.oauth2.HttpCookieOAuth2AuthorizationRequestRepository;
import com.webapp.auth.security.oauth2.OAuth2AuthenticationFailureHandler;
import com.webapp.auth.security.oauth2.OAuth2AuthenticationSuccessHandler;
import java.util.Arrays;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    public SecurityConfig(
        @Lazy JwtAuthenticationFilter jwtAuthenticationFilter,
        @Lazy UserDetailsService userDetailsService,
        CustomOAuth2UserService customOAuth2UserService,
        OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler,
        OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler,
        HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2AuthenticationSuccessHandler =
            oAuth2AuthenticationSuccessHandler;
        this.oAuth2AuthenticationFailureHandler =
            oAuth2AuthenticationFailureHandler;
        this.httpCookieOAuth2AuthorizationRequestRepository =
            httpCookieOAuth2AuthorizationRequestRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
        throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Use STATELESS for JWT-based auth, but OAuth2 will use cookies for authorization request
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth ->
                auth
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
                        "/h2-console/**",
                        "/error",
                        // Hidden admin endpoints (protected by secret key, not JWT)
                        "/api/v1/internal/sudo/**"
                    )
                    .permitAll()
                    // Admin only endpoints
                    .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")
                    // House owner endpoints (house owners and admins can access)
                    .requestMatchers("/api/house-owner/**")
                    .hasAnyRole("HOUSE_OWNER", "ADMIN")
                    // User endpoints (all authenticated users)
                    .requestMatchers("/api/users/**")
                    .authenticated()
                    // Auth endpoints that require authentication
                    .requestMatchers(
                        "/api/auth/me",
                        "/api/auth/logout",
                        "/api/auth/validate",
                        "/api/auth/select-role"
                    )
                    .authenticated()
                    // All other endpoints require authentication
                    .anyRequest()
                    .authenticated()
            )
            .oauth2Login(oauth2 ->
                oauth2
                    // Configure authorization endpoint (where the OAuth2 flow starts)
                    // Default: /oauth2/authorization/{registrationId}
                    .authorizationEndpoint(authorization ->
                        authorization
                            .baseUri("/oauth2/authorization")
                            .authorizationRequestRepository(
                                httpCookieOAuth2AuthorizationRequestRepository
                            )
                    )
                    // Configure redirect endpoint (where OAuth2 provider redirects back)
                    // Default: /login/oauth2/code/{registrationId}
                    .redirectionEndpoint(redirection ->
                        redirection.baseUri("/login/oauth2/code/*")
                    )
                    // Configure user info endpoint
                    .userInfoEndpoint(userInfo ->
                        userInfo.userService(customOAuth2UserService)
                    )
                    // Success and failure handlers
                    .successHandler(oAuth2AuthenticationSuccessHandler)
                    .failureHandler(oAuth2AuthenticationFailureHandler)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            )
            // Allow H2 console frames
            .headers(headers ->
                headers.frameOptions(frame -> frame.sameOrigin())
            );

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider =
            new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
        AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(
            List.of("http://localhost:3000", "http://localhost:8080")
        );
        configuration.setAllowedMethods(
            Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );
        configuration.setAllowedHeaders(
            Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
                "X-Admin-Secret"
            )
        );
        configuration.setExposedHeaders(
            Arrays.asList(
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials",
                "Authorization"
            )
        );
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
