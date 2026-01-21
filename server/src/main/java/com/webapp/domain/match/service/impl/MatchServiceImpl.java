package com.webapp.domain.match.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.match.dto.MatchRequest;
import com.webapp.domain.match.dto.MatchResponse;
import com.webapp.domain.match.entity.Match;
import com.webapp.domain.match.mapper.MatchMapper;
import com.webapp.domain.match.repository.MatchRepository;
import com.webapp.domain.match.service.MatchService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final UserService userService;
    private final MatchMapper matchMapper;

    @Override
    @Transactional
    public MatchResponse createMatch(Long userId, MatchRequest request) {
        User user1 = userService.getUserById(userId);
        User user2 = userService.getUserById(request.getTargetUserId());

        if (user1.getId().equals(user2.getId())) {
            throw new IllegalArgumentException("Cannot match with yourself");
        }

        if (matchRepository.findByUsers(user1, user2).isPresent()) {
            throw new IllegalArgumentException("Match already exists");
        }

        Match match = Match.builder()
                .user1(user1)
                .user2(user2)
                .matchPercentage(request.getMatchPercentage() != null ? request.getMatchPercentage() : 0.0)
                .build();

        return matchMapper.toResponse(matchRepository.save(match), userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MatchResponse> getMyMatches(Long userId, Pageable pageable) {
        User user = userService.getUserById(userId);
        return matchRepository.findByUser(user, pageable)
                .map(match -> matchMapper.toResponse(match, userId));
    }

    @Override
    @Transactional
    public void unmatch(Long userId, Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found"));

        if (!match.getUser1().getId().equals(userId) && !match.getUser2().getId().equals(userId)) {
            throw new SecurityException("Not authorized");
        }

        matchRepository.delete(match);
    }
}
