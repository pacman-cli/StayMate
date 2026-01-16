package com.webapp.domain.roommate;

import org.springframework.stereotype.Component;

@Component
public class RoommatePostMapper {

  public RoommatePostDto toDto(RoommatePost post) {
    if (post == null) {
      return null;
    }

    return RoommatePostDto.builder()
        .id(post.getId())
        .userId(post.getUser().getId())
        .userName(post.getUser().getFirstName() + " " + post.getUser().getLastName())
        .userAvatar(post.getUser().getProfilePictureUrl())
        .location(post.getLocation())
        .budget(post.getBudget())
        .moveInDate(post.getMoveInDate())
        .bio(post.getBio())
        .genderPreference(post.getGenderPreference())
        .smoking(post.getSmoking())
        .pets(post.getPets())
        .occupation(post.getOccupation())
        .latitude(post.getLatitude())
        .longitude(post.getLongitude())
        .status(post.getStatus())
        .createdAt(post.getCreatedAt() != null ? post.getCreatedAt().toString() : null)
        .build();
  }
}
