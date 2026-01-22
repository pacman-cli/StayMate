# Database

MySQL database architecture and schema design.

---

## Overview

| Component | Technology |
|-----------|------------|
| Database | MySQL 8.0+ |
| ORM | Hibernate (JPA) |
| Migrations | Flyway |
| Pool | HikariCP |

---

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ PROPERTY : owns
    USER ||--o{ BOOKING : makes
    USER ||--o{ BOOKING : receives
    USER ||--o{ REVIEW : writes
    USER ||--o{ MESSAGE : sends
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ PAYOUT_METHOD : has
    USER ||--o{ VERIFICATION_REQUEST : submits

    PROPERTY ||--o{ BOOKING : has
    PROPERTY ||--o{ REVIEW : receives
    PROPERTY ||--o{ SAVED_ITEM : savedBy
    PROPERTY ||--o{ MAINTENANCE_REQUEST : has

    CONVERSATION ||--o{ MESSAGE : contains
    CONVERSATION }o--o{ USER : participants

    BOOKING ||--o{ PAYMENT : generates
```

---

## In This Section

| Document | Description |
|----------|-------------|
| [Schema Design](schema-design.md) | Table structures |
| [Entity Relationships](entity-relationships.md) | ER diagrams |
| [Indexing Strategy](indexing-strategy.md) | Performance indexes |
| [Transactions](transactions.md) | Transaction management |
| [Migrations](migrations.md) | Flyway migrations |

---

## Key Entities

| Entity | Table | Records |
|--------|-------|---------|
| User | `users` | Core identity |
| Property | `properties` | Listings |
| Booking | `bookings` | Reservations |
| Message | `messages` | Chat |
| Notification | `notifications` | Alerts |
