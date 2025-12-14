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

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) {
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
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(
            (int) (jwtTokenProvider.getRefreshTokenExpirationMs() / 1000)
        );
        response.addCookie(refreshTokenCookie);

        return UriComponentsBuilder.fromUriString(authorizedRedirectUri)
            .queryParam("token", accessToken)
            .queryParam("refreshToken", refreshToken)
            .build()
            .toUriString();
    }
}
