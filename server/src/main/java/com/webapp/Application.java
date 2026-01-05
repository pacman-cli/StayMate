package com.webapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Main Spring Boot Application class.
 *
 * This class is placed at the root package (com.webapp) so that Spring Boot
 * can automatically scan all sub-packages (auth, domain) for components,
 * entities, and repositories.
 */
@SpringBootApplication(scanBasePackages = {
                "com.webapp.auth",
                "com.webapp.domain",
                "com.webapp.service"
})
@org.springframework.scheduling.annotation.EnableScheduling
@org.springframework.scheduling.annotation.EnableAsync
@EntityScan(basePackages = {
                "com.webapp.domain.user.entity",
                "com.webapp.domain.messaging.entity",
                "com.webapp.domain.notification.entity",
                "com.webapp.domain.application.entity",
                "com.webapp.domain.booking.entity",
                "com.webapp.domain.match.entity",
                "com.webapp.domain.match.entity",
                "com.webapp.domain.property.entity",
                "com.webapp.domain.review.entity",
                "com.webapp.domain.report.entity",
                "com.webapp.domain.roommate",
                "com.webapp.domain.audit.entity",
                "com.webapp.domain.maintenance.entity",
                "com.webapp.domain.saved.entity",
                "com.webapp.domain.setting.entity",
                "com.webapp.domain.verification.entity"
})
@EnableJpaRepositories(basePackages = {
                "com.webapp.domain.user.repository",
                "com.webapp.domain.messaging.repository",
                "com.webapp.domain.notification.repository",
                "com.webapp.domain.application.repository",
                "com.webapp.domain.booking.repository",
                "com.webapp.domain.match.repository",
                "com.webapp.domain.property.repository",
                "com.webapp.domain.dashboard.repository",
                "com.webapp.domain.review.repository",
                "com.webapp.domain.report.repository",
                "com.webapp.domain.roommate",
                "com.webapp.domain.audit.repository",
                "com.webapp.domain.maintenance.repository",
                "com.webapp.domain.saved.repository",
                "com.webapp.domain.setting.repository",
                "com.webapp.domain.verification.repository"
})
public class Application {

        public static void main(String[] args) {
                SpringApplication.run(Application.class, args);
        }
}
