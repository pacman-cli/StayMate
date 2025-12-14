package com.webapp.auth.mapper;

import com.webapp.auth.dto.response.AuthResponse;
import com.webapp.domain.user.dto.UserDto;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Mapper for creating authentication responses.
 * Delegates user mapping to UserMapper to avoid code duplication.
 */
@Component
@RequiredArgsConstructor
public class AuthResponseMapper {

    private final UserMapper userMapper;

    /**
     * Creates an AuthResponse with tokens and user information.
     *
     * @param accessToken  The JWT access token
     * @param refreshToken The JWT refresh token
     * @param expiresIn    Token expiration time in seconds
     * @param user         The authenticated user entity
     * @return AuthResponse containing tokens and user DTO
     */
    public AuthResponse toAuthResponse(
        String accessToken,
        String refreshToken,
        Long expiresIn,
        User user
    ) {
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(expiresIn)
            .user(toUserDto(user))
            .build();
    }

    /**
     * Maps a User entity to UserDto using the shared UserMapper.
     * This eliminates duplicate mapping logic that was previously in this class.
     *
     * @param user The user entity to map
     * @return UserDto representation of the user
     */
    public UserDto toUserDto(User user) {
        return userMapper.toDto(user);
    }
}
