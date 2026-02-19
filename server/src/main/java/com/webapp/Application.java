package com.webapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.*;

/**
 * Main Spring Boot Application class.
 * <p>
 * This class is placed at the root package (com.webapp) so that Spring Boot can automatically scan all sub-packages
 * (auth, domain) for components, entities, and repositories.
 */
@SpringBootApplication(scanBasePackages = {
        "com.webapp.auth",
        "com.webapp.domain",
        "com.webapp.service",
        "com.webapp.config"
})
@EnableScheduling
@EnableAsync
// Rely on default scanning for simpler maintenance
// @EntityScan and @EnableJpaRepositories are removed to prevent duplication
// errors
// and ensuring all sub-packages are scanned automatically by
// @SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
