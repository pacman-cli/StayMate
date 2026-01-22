# Event Flow

How notifications and asynchronous events flow through StayMate.

---

## Notification Architecture

```mermaid
graph TB
    subgraph "Trigger Sources"
        BOOKING[Booking Events]
        MESSAGE[New Messages]
        REVIEW[Reviews]
        SYSTEM[System Events]
    end

    subgraph "Notification Service"
        NS[NotificationService]
        QUEUE[Event Queue]
    end

    subgraph "Delivery Channels"
        PUSH[Push Notification]
        EMAIL[Email]
        INAPP[In-App]
        WS[WebSocket]
    end

    BOOKING --> NS
    MESSAGE --> NS
    REVIEW --> NS
    SYSTEM --> NS

    NS --> QUEUE
    QUEUE --> PUSH
    QUEUE --> EMAIL
    QUEUE --> INAPP
    QUEUE --> WS
```

---

## Event Types

| Event | Trigger | Recipients | Channels |
|-------|---------|------------|----------|
| `BOOKING_REQUEST` | Tenant creates booking | Landlord | Push, In-App |
| `BOOKING_APPROVED` | Landlord approves | Tenant | Push, In-App, Email |
| `BOOKING_REJECTED` | Landlord rejects | Tenant | Push, In-App |
| `MESSAGE_RECEIVED` | New message | Recipient | Push, In-App |
| `REVIEW_RECEIVED` | New review | Property owner | In-App |
| `PAYOUT_PROCESSED` | Payout completed | Landlord | Push, In-App, Email |

---

## Booking Event Flow

```mermaid
sequenceDiagram
    participant BS as BookingService
    participant NS as NotificationService
    participant NR as NotificationRepository
    participant WS as WebSocket
    participant U as User

    BS->>NS: onBookingCreated(booking)
    NS->>NS: Build notification payload
    NS->>NR: save(notification)
    NR-->>NS: Notification ID

    NS->>WS: broadcast(landlordId, event)
    WS-->>U: Real-time update

    Note over U: User sees notification
```

---

## Notification Entity

```java
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String title;
    private String message;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> data;

    private boolean read;
    private LocalDateTime createdAt;
}
```

---

## Message Event Flow

```mermaid
sequenceDiagram
    participant S as Sender
    participant MC as MessageController
    participant MS as MessagingService
    participant NS as NotificationService
    participant WS as WebSocketHandler
    participant R as Recipient

    S->>MC: POST /api/messages
    MC->>MS: sendMessage(request)
    MS->>MS: Save message
    MS->>NS: notifyNewMessage(recipient, message)
    NS->>WS: sendToUser(recipientId, payload)
    WS-->>R: WebSocket event

    alt Recipient offline
        NS->>NS: Queue for later
    end
```

---

## WebSocket Configuration

```java
// WebSocketConfig.java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*")
                .withSockJS();
    }
}
```

---

## Event Patterns

### Fire and Forget

```java
// Non-blocking notification
@Async
public void sendNotification(Notification notification) {
    notificationRepository.save(notification);
    webSocketService.broadcast(notification);
}
```

### Transactional Outbox (Recommended for Critical Events)

```mermaid
flowchart LR
    TX[Transaction] --> |1| DB[(Save Entity)]
    TX --> |2| OUTBOX[(Save to Outbox)]
    SCHEDULER[Scheduler] --> |3| OUTBOX
    SCHEDULER --> |4| SEND[Send Notification]
    SEND --> |5| MARK[Mark Sent]
```

!!! info "Design Note"
    Currently using fire-and-forget. Outbox pattern recommended for payment notifications.
