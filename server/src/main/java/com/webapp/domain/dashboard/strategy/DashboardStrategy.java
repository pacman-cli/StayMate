package com.webapp.domain.dashboard.strategy;

import com.webapp.domain.dashboard.dto.DashboardStats;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.enums.RoleName;

public interface DashboardStrategy {
    RoleName getRole();

    DashboardStats aggregate(User user);
}
