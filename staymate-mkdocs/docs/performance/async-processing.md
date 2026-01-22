# Async Processing

Asynchronous method execution in StayMate.

---

## Current Usage

`@Async` is used in two services:

### AuditService

```java
// domain/audit/service/AuditService.java
@Async
public void logAction(AuditAction action) {
    // Non-blocking audit logging
}

@Async
public void logSecurityEvent(SecurityEvent event) {
    // Non-blocking security logging
}
```

### WebSocketNotificationService

```java
// domain/notification/service/WebSocketNotificationService.java
@Async
public void sendNotification(Long userId, Notification notification) {
    // Non-blocking WebSocket push
}

@Async
public void broadcastNotification(Notification notification) {
    // Non-blocking broadcast
}
```

---

## Purpose

| Service | Why Async |
|---------|-----------|
| **AuditService** | Audit logging shouldn't block API responses |
| **WebSocketNotificationService** | WebSocket pushes are I/O bound |

---

## Configuration

!!! warning "Missing @EnableAsync"
    The codebase uses `@Async` annotations but `@EnableAsync` was not found in configuration.

    To enable async processing, add to a configuration class:

    ```java
    @Configuration
    @EnableAsync
    public class AsyncConfig {
    }
    ```

---

## Thread Pool (Recommended)

For production, configure a custom thread pool:

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("Async-");
        executor.initialize();
        return executor;
    }
}
```
