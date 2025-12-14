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
@SpringBootApplication(
    scanBasePackages = {
        "com.webapp.auth",
        "com.webapp.domain"
    }
)
@EntityScan(basePackages = {
    "com.webapp.domain.user.entity",
    "com.webapp.domain.messaging.entity",
    "com.webapp.domain.notification.entity"
})
@EnableJpaRepositories(basePackages = {
    "com.webapp.domain.user.repository",
    "com.webapp.domain.messaging.repository",
    "com.webapp.domain.notification.repository"
})
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
