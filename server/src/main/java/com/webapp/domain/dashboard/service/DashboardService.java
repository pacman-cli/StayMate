package com.webapp.domain.dashboard.service;

import com.webapp.domain.dashboard.dto.AdminDashboardDTO;
import com.webapp.domain.dashboard.dto.DashboardStats;
import com.webapp.domain.dashboard.dto.LandlordDashboardDTO;
import com.webapp.domain.dashboard.dto.UserDashboardDTO;
import com.webapp.domain.user.entity.User;

public interface DashboardService {
    DashboardStats getUserStats(User user);

    AdminDashboardDTO getAdminDashboard(User user);

    LandlordDashboardDTO getLandlordDashboard(User user);

    UserDashboardDTO getUserDashboard(User user);
}
