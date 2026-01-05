package com.webapp.domain.match.mapper;

import com.webapp.domain.match.dto.MatchResponse;
import com.webapp.domain.match.entity.Match;
import com.webapp.domain.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class MatchMapper {

    /**
     * Converts match entity to match response DTO
     */
    public MatchResponse toResponse(Match match, Long currentUserId) {
        if (match == null) {
            return null;
        }
        User matchedUser = match.getUser1().getId().equals(currentUserId) ? match.getUser2() : match.getUser1();
        User currentUser = match.getUser1().getId().equals(currentUserId) ? match.getUser1() : match.getUser2();

        // Populates response with current user information
        return MatchResponse.builder()
                .id(match.getId())
                .userId(currentUser.getId())
                .userName(currentUser.getFullName())
                .userProfilePictureUrl(currentUser.getProfilePictureUrl())
                // Matched user info
                .matchedUserId(matchedUser.getId())
                .matchedUserName(matchedUser.getFullName())
                .matchedUserProfilePictureUrl(matchedUser.getProfilePictureUrl())
                .matchPercentage(match.getMatchPercentage())
                .createdAt(match.getCreatedAt())
                .build();
    }
}
