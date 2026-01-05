package com.webapp.domain.dashboard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.dashboard.dto.AdminDashboardDTO;
import com.webapp.domain.dashboard.dto.DashboardStats;
import com.webapp.domain.dashboard.dto.LandlordDashboardDTO;
import com.webapp.domain.dashboard.dto.UserDashboardDTO;
import com.webapp.domain.dashboard.service.DashboardService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats(@AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(dashboardService.getUserStats(user));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardDTO> getAdminDashboard(@AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(dashboardService.getAdminDashboard(user));
    }

    @GetMapping("/landlord")
    @PreAuthorize("hasRole('HOUSE_OWNER')")
    public ResponseEntity<LandlordDashboardDTO> getLandlordDashboard(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(dashboardService.getLandlordDashboard(user));
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserDashboardDTO> getUserDashboard(@AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(dashboardService.getUserDashboard(user));
    }
}
