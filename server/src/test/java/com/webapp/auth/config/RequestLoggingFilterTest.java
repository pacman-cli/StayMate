package com.webapp.auth.config;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
@DisplayName("RequestLoggingFilter Tests")
class RequestLoggingFilterTest {

  private RequestLoggingFilter requestLoggingFilter;

  @Mock
  private HttpServletRequest request;

  @Mock
  private HttpServletResponse response;

  @Mock
  private FilterChain filterChain;

  @BeforeEach
  void setUp() {
    requestLoggingFilter = new RequestLoggingFilter();
  }

  @Test
  @DisplayName("Should add X-Request-ID header")
  void shouldAddRequestIdHeader() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/users");
    when(request.getMethod()).thenReturn("GET");
    when(request.getRemoteAddr()).thenReturn("127.0.0.1");

    requestLoggingFilter.doFilterInternal(request, response, filterChain);

    verify(response).setHeader(eq("X-Request-ID"), anyString());
    verify(filterChain).doFilter(request, response);
  }

  @Test
  @DisplayName("Should skip logging for excluded paths")
  void shouldSkipLoggingForExcludedPaths() throws Exception {
    when(request.getRequestURI()).thenReturn("/actuator/health");

    requestLoggingFilter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);
    verify(response, never()).setHeader(eq("X-Request-ID"), anyString());
  }

  @Test
  @DisplayName("Should skip logging for static resources")
  void shouldSkipLoggingForStaticResources() throws Exception {
    when(request.getRequestURI()).thenReturn("/static/app.js");

    requestLoggingFilter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);
    verify(response, never()).setHeader(eq("X-Request-ID"), anyString());
  }

  @Test
  @DisplayName("Should use X-Forwarded-For for client IP")
  void shouldUseXForwardedForForClientIp() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/data");
    when(request.getMethod()).thenReturn("POST");
    when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.50");
    lenient().when(request.getRemoteAddr()).thenReturn("127.0.0.1");

    requestLoggingFilter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);
    // The log should contain 203.0.113.50
  }

  @Test
  @DisplayName("Should continue filter chain even for API requests")
  void shouldContinueFilterChainForApiRequests() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/bookings");
    when(request.getMethod()).thenReturn("DELETE");
    when(request.getRemoteAddr()).thenReturn("10.0.0.1");

    requestLoggingFilter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);
  }
}
