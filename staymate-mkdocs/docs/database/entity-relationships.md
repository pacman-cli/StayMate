# Entity Relationships

Complete entity relationship diagram for StayMate.

---

## Full ER Diagram

```mermaid
erDiagram
    USER {
        Long id PK
        String email UK
        String password_hash
        String first_name
        String last_name
        String phone_number
        String profile_picture_url
        AuthProvider auth_provider
        Set roles
        Boolean email_verified
        LocalDateTime created_at
    }

    PROPERTY {
        Long id PK
        String title
        Text description
        BigDecimal price
        BigDecimal deposit
        PropertyType type
        PropertyStatus status
        Integer bedrooms
        Integer bathrooms
        String address
        String city
        Long owner_id FK
        LocalDateTime created_at
    }

    BOOKING {
        Long id PK
        Long property_id FK
        Long tenant_id FK
        LocalDate start_date
        LocalDate end_date
        BookingStatus status
        BigDecimal total_amount
        LocalDateTime check_in
        LocalDateTime check_out
    }

    MESSAGE {
        Long id PK
        Long conversation_id FK
        Long sender_id FK
        Text content
        Boolean read
        LocalDateTime created_at
    }

    NOTIFICATION {
        Long id PK
        Long user_id FK
        NotificationType type
        String title
        String message
        Boolean read
        LocalDateTime created_at
    }

    REVIEW {
        Long id PK
        Long reviewer_id FK
        Long reviewee_id FK
        Long property_id FK
        Integer rating
        Text comment
        LocalDateTime created_at
    }

    USER ||--o{ PROPERTY : owns
    USER ||--o{ BOOKING : "makes (tenant)"
    PROPERTY ||--o{ BOOKING : has
    USER ||--o{ MESSAGE : sends
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ REVIEW : writes
    PROPERTY ||--o{ REVIEW : receives
```

---

## Core Relationships

| Parent | Child | Type | Description |
|--------|-------|------|-------------|
| User | Property | One-to-Many | Landlord owns properties |
| User | Booking | One-to-Many | Tenant makes bookings |
| Property | Booking | One-to-Many | Property has bookings |
| User | Message | One-to-Many | User sends messages |
| User | Notification | One-to-Many | User receives notifications |
| User | Review | One-to-Many | User writes reviews |
