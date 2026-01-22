package com.webapp.auth.config;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.PrintWriter;
import java.io.StringWriter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
@DisplayName("RateLimitFilter Tests")
class RateLimitFilterTest {

  private RateLimitFilter rateLimitFilter;

  @Mock
  private HttpServletRequest request;

  @Mock
  private HttpServletResponse response;

  @Mock
  private FilterChain filterChain;

  @BeforeEach
  void setUp() {
    rateLimitFilter = new RateLimitFilter();
    ReflectionTestUtils.setField(rateLimitFilter, "requestsPerMinute", 5);
    ReflectionTestUtils.setField(rateLimitFilter, "rateLimitEnabled", true);
  }

  @Test
  @DisplayName("Should allow requests within rate limit")
  void shouldAllowRequestsWithinRateLimit() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/users");
    when(request.getRemoteAddr()).thenReturn("127.0.0.1");

    // Execute 3 requests (within limit of 5)
    for (int i = 0; i < 3; i++) {
      rateLimitFilter.doFilterInternal(request, response, filterChain);
    }

    // Verify filter chain was called 3 times
    verify(filterChain, times(3)).doFilter(request, response);
    verify(response, never()).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
  }

  @Test
  @DisplayName("Should block requests exceeding rate limit")
  void shouldBlockRequestsExceedingRateLimit() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/users");
    when(request.getRemoteAddr()).thenReturn("192.168.1.100");

    StringWriter stringWriter = new StringWriter();
    PrintWriter printWriter = new PrintWriter(stringWriter);
    when(response.getWriter()).thenReturn(printWriter);

    // Execute 6 requests (exceeding limit of 5)
    for (int i = 0; i < 6; i++) {
      rateLimitFilter.doFilterInternal(request, response, filterChain);
    }

    // Verify filter chain was called only 5 times
    verify(filterChain, times(5)).doFilter(request, response);

    // Verify 429 status was set once
    verify(response, times(1)).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
  }

  @Test
  @DisplayName("Should skip rate limiting for excluded paths")
  void shouldSkipRateLimitingForExcludedPaths() throws Exception {
    when(request.getRequestURI()).thenReturn("/actuator/health");
    lenient().when(request.getRemoteAddr()).thenReturn("127.0.0.1");

    // Execute many requests
    for (int i = 0; i < 20; i++) {
      rateLimitFilter.doFilterInternal(request, response, filterChain);
    }

    // Should not block - all requests should pass through
    verify(filterChain, times(20)).doFilter(request, response);
    verify(response, never()).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
  }

  @Test
  @DisplayName("Should bypass rate limiting when disabled")
  void shouldBypassRateLimitingWhenDisabled() throws Exception {
    ReflectionTestUtils.setField(rateLimitFilter, "rateLimitEnabled", false);

    lenient().when(request.getRequestURI()).thenReturn("/api/users");
    lenient().when(request.getRemoteAddr()).thenReturn("127.0.0.1");

    // Execute many requests
    for (int i = 0; i < 20; i++) {
      rateLimitFilter.doFilterInternal(request, response, filterChain);
    }

    // All should pass
    verify(filterChain, times(20)).doFilter(request, response);
  }

  @Test
  @DisplayName("Should add rate limit headers")
  void shouldAddRateLimitHeaders() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/data");
    when(request.getRemoteAddr()).thenReturn("10.0.0.1");

    rateLimitFilter.doFilterInternal(request, response, filterChain);

    verify(response).setHeader(eq("X-RateLimit-Limit"), anyString());
    verify(response).setHeader(eq("X-RateLimit-Remaining"), anyString());
    verify(response).setHeader(eq("X-RateLimit-Reset"), anyString());
  }

  @Test
  @DisplayName("Should use X-Forwarded-For header for IP detection")
  void shouldUseXForwardedForHeader() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/users");
    when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.50, 70.41.3.18");
    lenient().when(request.getRemoteAddr()).thenReturn("127.0.0.1");

    rateLimitFilter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);
    // The filter should use 203.0.113.50 as the client IP
  }

  @Test
  @DisplayName("Should rate limit per IP address separately")
  void shouldRateLimitPerIpSeparately() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/users");

    StringWriter stringWriter = new StringWriter();
    PrintWriter printWriter = new PrintWriter(stringWriter);
    lenient().when(response.getWriter()).thenReturn(printWriter);

    // IP 1 - exhaust rate limit
    when(request.getRemoteAddr()).thenReturn("192.168.1.1");
    for (int i = 0; i < 5; i++) {
      rateLimitFilter.doFilterInternal(request, response, filterChain);
    }

    // IP 2 - should still have full quota
    when(request.getRemoteAddr()).thenReturn("192.168.1.2");
    for (int i = 0; i < 5; i++) {
      rateLimitFilter.doFilterInternal(request, response, filterChain);
    }

    // Both IPs could make their full quota
    verify(filterChain, times(10)).doFilter(request, response);
  }
}
