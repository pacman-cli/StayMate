package com.webapp.auth.security;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.domain.admin.service.SystemSettingService;
import com.webapp.domain.user.enums.RoleName;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class MaintenanceModeFilter extends OncePerRequestFilter {

  private final SystemSettingService systemSettingService;
  private final ObjectMapper objectMapper;

  // Paths that should ALWAYS be accessible even in maintenance mode
  private static final List<String> WHITELIST_PATHS = Arrays.asList(
      "/api/auth/login",
      "/api/auth/logout",
      "/api/auth/refresh-token",
      "/api/auth/check-email",
      "/api/admin", // Allow admin endpoints so admins can turn it off!
      "/actuator/health",
      "/swagger-ui",
      "/v3/api-docs");

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    if (systemSettingService.isMaintenanceModeEnabled()) {
      String path = request.getRequestURI();

      // 1. Allow Whitelisted Paths
      if (isWhitelisted(path)) {
        filterChain.doFilter(request, response);
        return;
      }

      // 2. Allow Admins
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      if (auth != null && auth.isAuthenticated() && isAdmin(auth)) {
        filterChain.doFilter(request, response);
        return;
      }

      // 3. Block Everyone Else
      log.warn("Maintenance Mode Active: Blocking request to {}", path);
      response.setStatus(HttpStatus.SERVICE_UNAVAILABLE.value());
      response.setContentType("application/json");
      response.getWriter().write(objectMapper.writeValueAsString(new MaintenanceResponse(
          "System is under maintenance. Please try again later.",
          true)));
      return;
    }

    filterChain.doFilter(request, response);
  }

  private boolean isWhitelisted(String path) {
    return WHITELIST_PATHS.stream().anyMatch(path::startsWith);
  }

  private boolean isAdmin(Authentication auth) {
    return auth.getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals(RoleName.ROLE_ADMIN.name()));
  }

  // Simple DTO for response
  static class MaintenanceResponse {
    public String message;
    public boolean maintenanceMode;

    public MaintenanceResponse(String message, boolean maintenanceMode) {
      this.message = message;
      this.maintenanceMode = maintenanceMode;
    }
  }
}
