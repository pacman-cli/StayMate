package com.webapp.auth.config;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Rate limiting filter to prevent API abuse.
 * Uses in-memory token bucket algorithm with configurable limits.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

  @Value("${rate.limit.requests-per-minute:60}")
  private int requestsPerMinute;

  @Value("${rate.limit.enabled:true}")
  private boolean rateLimitEnabled;

  // IP-based rate limiting storage
  private final Map<String, RateLimitInfo> rateLimitCache = new ConcurrentHashMap<>();

  // Cleanup old entries every 5 minutes
  private long lastCleanup = System.currentTimeMillis();
  private static final long CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {

    if (!rateLimitEnabled) {
      filterChain.doFilter(request, response);
      return;
    }

    // Skip rate limiting for static resources
    String path = request.getRequestURI();
    if (isExcludedPath(path)) {
      filterChain.doFilter(request, response);
      return;
    }

    String clientId = getClientIdentifier(request);

    // Periodic cleanup of expired entries
    cleanupIfNeeded();

    RateLimitInfo rateLimitInfo = rateLimitCache.computeIfAbsent(
        clientId,
        k -> new RateLimitInfo(requestsPerMinute));

    if (rateLimitInfo.tryConsume()) {
      // Add rate limit headers
      response.setHeader("X-RateLimit-Limit", String.valueOf(requestsPerMinute));
      response.setHeader("X-RateLimit-Remaining", String.valueOf(rateLimitInfo.getRemaining()));
      response.setHeader("X-RateLimit-Reset", String.valueOf(rateLimitInfo.getResetTime()));

      filterChain.doFilter(request, response);
    } else {
      // Rate limit exceeded
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      response.setHeader("X-RateLimit-Limit", String.valueOf(requestsPerMinute));
      response.setHeader("X-RateLimit-Remaining", "0");
      response.setHeader("X-RateLimit-Reset", String.valueOf(rateLimitInfo.getResetTime()));
      response.setHeader("Retry-After", String.valueOf(rateLimitInfo.getSecondsUntilReset()));

      response.getWriter().write("""
          {
              "error": "Too Many Requests",
              "message": "Rate limit exceeded. Please try again later.",
              "retryAfter": %d
          }
          """.formatted(rateLimitInfo.getSecondsUntilReset()));
    }
  }

  private String getClientIdentifier(HttpServletRequest request) {
    // Try to get real IP from proxy headers
    String forwardedFor = request.getHeader("X-Forwarded-For");
    if (forwardedFor != null && !forwardedFor.isEmpty()) {
      return forwardedFor.split(",")[0].trim();
    }

    String realIp = request.getHeader("X-Real-IP");
    if (realIp != null && !realIp.isEmpty()) {
      return realIp;
    }

    return request.getRemoteAddr();
  }

  private boolean isExcludedPath(String path) {
    // Static resources
    if (path.startsWith("/actuator") ||
        path.startsWith("/swagger") ||
        path.startsWith("/v3/api-docs") ||
        path.startsWith("/favicon") ||
        path.endsWith(".css") ||
        path.endsWith(".js") ||
        path.endsWith(".ico")) {
      return true;
    }

    // High-frequency read endpoints - exclude from rate limiting
    // These are safe GET operations that users trigger frequently
    if (path.contains("/check") || // Save status checks
        path.contains("/saved/") || // Saved items (read)
        path.contains("/notifications") || // Notifications polling
        path.contains("/matches")) { // Match listing
      return true;
    }

    return false;
  }

  private void cleanupIfNeeded() {
    long now = System.currentTimeMillis();
    if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
      lastCleanup = now;
      long expiryThreshold = now - TimeUnit.MINUTES.toMillis(2);
      rateLimitCache.entrySet().removeIf(
          entry -> entry.getValue().getLastAccessTime() < expiryThreshold);
    }
  }

  /**
   * Rate limit information for a single client.
   */
  private static class RateLimitInfo {
    private final int maxRequests;
    private int remainingRequests;
    private long windowStart;
    private long lastAccessTime;
    private static final long WINDOW_MS = 60_000; // 1 minute window

    public RateLimitInfo(int maxRequests) {
      this.maxRequests = maxRequests;
      this.remainingRequests = maxRequests;
      this.windowStart = System.currentTimeMillis();
      this.lastAccessTime = this.windowStart;
    }

    public synchronized boolean tryConsume() {
      long now = System.currentTimeMillis();
      lastAccessTime = now;

      // Reset window if expired
      if (now - windowStart >= WINDOW_MS) {
        windowStart = now;
        remainingRequests = maxRequests;
      }

      if (remainingRequests > 0) {
        remainingRequests--;
        return true;
      }
      return false;
    }

    public int getRemaining() {
      return Math.max(0, remainingRequests);
    }

    public long getResetTime() {
      return windowStart + WINDOW_MS;
    }

    public long getSecondsUntilReset() {
      long now = System.currentTimeMillis();
      long resetTime = windowStart + WINDOW_MS;
      return Math.max(0, (resetTime - now) / 1000);
    }

    public long getLastAccessTime() {
      return lastAccessTime;
    }
  }
}
