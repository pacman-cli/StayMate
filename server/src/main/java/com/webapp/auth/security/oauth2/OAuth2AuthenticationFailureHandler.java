package com.webapp.auth.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationFailureHandler
    extends SimpleUrlAuthenticationFailureHandler {

    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Value(
        "${app.oauth2.authorized-redirect-uri:http://localhost:3000/oauth2/redirect}"
    )
    private String defaultRedirectUri;

    @Override
    public void onAuthenticationFailure(
        HttpServletRequest request,
        HttpServletResponse response,
        AuthenticationException exception
    ) throws IOException, ServletException {
        log.error("OAuth2 authentication failed: {}", exception.getMessage());

        String targetUrl = getRedirectUri(request);

        targetUrl = UriComponentsBuilder.fromUriString(targetUrl)
            .queryParam(
                "error",
                URLEncoder.encode(
                    exception.getLocalizedMessage(),
                    StandardCharsets.UTF_8
                )
            )
            .build()
            .toUriString();

        // Clear OAuth2 authorization cookies
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(
            request,
            response
        );

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    /**
     * Get redirect URI from cookie if it was set during OAuth2 authorization,
     * otherwise use the default redirect URI.
     */
    private String getRedirectUri(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (
                    HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_COOKIE_NAME.equals(
                        cookie.getName()
                    )
                ) {
                    return cookie.getValue();
                }
            }
        }
        return defaultRedirectUri;
    }
}
