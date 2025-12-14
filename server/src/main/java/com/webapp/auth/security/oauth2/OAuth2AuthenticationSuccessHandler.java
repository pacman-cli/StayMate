package com.webapp.auth.security.oauth2;

import com.webapp.auth.security.JwtTokenProvider;
import com.webapp.auth.security.UserPrincipal;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler
    extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Value(
        "${app.oauth2.authorized-redirect-uri:http://localhost:3000/oauth2/redirect}"
    )
    private String authorizedRedirectUri;

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException, ServletException {
        String targetUrl = determineTargetUrl(
            request,
            response,
            authentication
        );

        if (response.isCommitted()) {
            log.debug(
                "Response has already been committed. Unable to redirect to " +
                    targetUrl
            );
            return;
        }

        // Clear authentication attributes and OAuth2 authorization cookies
        clearAuthenticationAttributes(request);
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(
            request,
            response
        );

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) {
        // Check if there's a redirect_uri cookie set during the OAuth2 flow
        String redirectUri = getRedirectUriFromCookie(request);
        if (redirectUri == null || redirectUri.isBlank()) {
            redirectUri = authorizedRedirectUri;
        }

        UserPrincipal userPrincipal =
            (UserPrincipal) authentication.getPrincipal();

        String accessToken = jwtTokenProvider.generateAccessToken(
            userPrincipal
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(
            userPrincipal
        );

        log.info(
            "OAuth2 authentication successful for user: {}",
            userPrincipal.getEmail()
        );

        // Add refresh token as HTTP-only cookie for security
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(false); // Set to true in production with HTTPS
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(
            (int) (jwtTokenProvider.getRefreshTokenExpirationMs() / 1000)
        );
        response.addCookie(refreshTokenCookie);

        // Build redirect URL with tokens
        return UriComponentsBuilder.fromUriString(redirectUri)
            .queryParam("token", accessToken)
            .queryParam("refreshToken", refreshToken)
            .build()
            .toUriString();
    }

    /**
     * Get redirect URI from cookie if it was set during OAuth2 authorization.
     */
    private String getRedirectUriFromCookie(HttpServletRequest request) {
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
        return null;
    }
}
