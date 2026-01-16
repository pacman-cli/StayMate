package com.webapp.auth.config;

import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.webapp.auth.security.JwtTokenProvider;
import com.webapp.domain.user.service.UserService;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

  private final JwtTokenProvider tokenProvider;
  private final UserService userService;

  public WebSocketAuthInterceptor(JwtTokenProvider tokenProvider, @Lazy UserService userService) {
    this.tokenProvider = tokenProvider;
    this.userService = userService;
  }

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
      String jwt = getJwtFromHeader(accessor);

      if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
        Long userId = tokenProvider.getUserIdFromToken(jwt);
        UserDetails userDetails = userService.loadUserById(userId);

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities());

        accessor.setUser(authentication);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        log.info("User {} authenticated via WebSocket. Principal Name: {}", userId, authentication.getName());
      } else {
        log.error("Invalid or missing JWT token for WebSocket connection. JWT: {}", jwt);
        throw new IllegalArgumentException("Invalid Token");
      }
    }
    return message;

  }

  private String getJwtFromHeader(StompHeaderAccessor accessor) {
    String bearerToken = accessor.getFirstNativeHeader("Authorization");
    if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7);
    }
    return null;
  }
}
