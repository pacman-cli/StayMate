package com.webapp.domain.user.mapper;

import com.webapp.domain.user.dto.UserDto;
import com.webapp.domain.user.entity.RoleName;
import com.webapp.domain.user.entity.User;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }

        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .profilePictureUrl(user.getProfilePictureUrl())
                .bio(user.getBio())
                .address(user.getAddress())
                .city(user.getCity())
                .emailVerified(user.isEmailVerified())
                .phoneVerified(user.isPhoneVerified())
                .roleSelected(user.isRoleSelected())
                .authProvider(user.getAuthProvider())
                .roles(
                        user.getRoles() != null
                                ? user
                                .getRoles()
                                .stream()
                                .map(RoleName::name)
                                .collect(Collectors.toSet())
                                : null
                )
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .enabled(user.isEnabled())
                .build();
    }

    public List<UserDto> toDtoList(List<User> users) {
        if (users == null) {
            return null;
        }

        return users.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
