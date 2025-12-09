package com.webapp.auth.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.oauth2.redirect-uri:http://localhost:3000/oauth2/redirect}")
    private String redirectUri;

    public static final String REDIRECT_URI_COOKIE_NAME = "redirect_uri";

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {
        log.error("OAuth2 authentication failed: {}", exception.getMessage());

        String targetUrl = getRedirectUri(request);

        targetUrl = UriComponentsBuilder.fromUriString(targetUrl)
                .queryParam("error", URLEncoder.encode(exception.getLocalizedMessage(), StandardCharsets.UTF_8))
                .build()
                .toUriString();

        // Clear any OAuth2 authorization cookies
        clearAuthorizationCookies(request, response);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String getRedirectUri(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (REDIRECT_URI_COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return redirectUri;
    }

    private void clearAuthorizationCookies(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (REDIRECT_URI_COOKIE_NAME.equals(cookie.getName()) ||
                    "oauth2_auth_request".equals(cookie.getName())) {
                    Cookie clearedCookie = new Cookie(cookie.getName(), "");
                    clearedCookie.setPath("/");
                    clearedCookie.setMaxAge(0);
                    clearedCookie.setHttpOnly(true);
                    response.addCookie(clearedCookie);
                }
            }
        }
    }
}
