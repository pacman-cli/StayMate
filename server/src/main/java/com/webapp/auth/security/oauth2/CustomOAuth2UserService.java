package com.webapp.auth.security.oauth2;

import java.util.Map;

import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.webapp.auth.exception.OAuth2AuthenticationProcessingException;
import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.enums.AuthProvider;
import com.webapp.domain.user.service.UserService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    public CustomOAuth2UserService(@org.springframework.context.annotation.Lazy UserService userService) {
        this.userService = userService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user", ex);
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();

        Map<String, Object> attributes = oAuth2User.getAttributes();
        GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(attributes);

        if (!StringUtils.hasText(userInfo.getEmail())) {
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }

        AuthProvider authProvider = getAuthProvider(registrationId);

        User user = userService.createOrUpdateOAuth2User(userInfo.getEmail(), userInfo.getFirstName(),
                userInfo.getLastName(), userInfo.getImageUrl(), userInfo.getId(), authProvider);

        log.info("OAuth2 user processed successfully: {}", user.getEmail());

        return UserPrincipal.create(user, attributes);
    }

    private AuthProvider getAuthProvider(String registrationId) {
        if ("google".equalsIgnoreCase(registrationId)) {
            return AuthProvider.GOOGLE;
        }
        throw new OAuth2AuthenticationProcessingException("Login with " + registrationId + " is not supported");
    }
}
