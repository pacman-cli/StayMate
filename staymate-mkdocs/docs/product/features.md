# Features

## Complete Feature Map

StayMate provides role-specific features for Tenants, Landlords, and Administrators.

---

## Feature Overview

```mermaid
graph TB
    subgraph "Tenant Features"
        T1[Property Search]
        T2[Booking]
        T3[Roommate Matching]
        T4[Messaging]
        T5[Reviews]
        T6[Saved Properties]
    end

    subgraph "Landlord Features"
        L1[Property Management]
        L2[Booking Approval]
        L3[Earnings Dashboard]
        L4[Payout Requests]
        L5[Tenant Communication]
    end

    subgraph "Admin Features"
        A1[User Management]
        A2[Content Moderation]
        A3[Analytics Dashboard]
        A4[Fraud Detection]
        A5[Financial Oversight]
    end
```

---

## Tenant Features

### Property Discovery

| Feature | Description | Endpoint |
|---------|-------------|----------|
| **Search** | Filter by location, price, type, amenities | `GET /api/properties/search` |
| **Recommendations** | AI-powered suggestions | `GET /api/properties/recommended` |
| **Details** | Full property info with images | `GET /api/properties/{id}` |
| **Save** | Bookmark for later | `POST /api/saved/properties` |

### Booking System

```mermaid
stateDiagram-v2
    [*] --> PENDING: Create Booking
    PENDING --> APPROVED: Landlord Approves
    PENDING --> REJECTED: Landlord Rejects
    PENDING --> CANCELLED: Tenant Cancels
    APPROVED --> CHECKED_IN: Check In
    CHECKED_IN --> CHECKED_OUT: Check Out
    CHECKED_OUT --> [*]
```

### Roommate Matching

- Create roommate posts with preferences
- Search compatible matches
- Direct messaging integration
- Match/unmatch functionality

### Messaging

- Real-time conversations (WebSocket-ready)
- Property-context conversations
- Unread count tracking
- Presence indicators

---

## Landlord Features

### Property Management

| Action | Description |
|--------|-------------|
| **Create** | List new property with images |
| **Update** | Modify details, pricing |
| **Status** | AVAILABLE / UNAVAILABLE / RENTED |
| **Delete** | Remove listing |

### Financial Operations

```mermaid
flowchart LR
    B[Booking Paid] --> E[Earnings Credited]
    E --> P[Payout Request]
    P --> A[Admin Approval]
    A --> T[Bank Transfer]
```

- Earnings summary and history
- Multiple payout methods
- Export reports (CSV/PDF)

---

## Admin Features

### User Management

- List, search, filter users
- Role management (promote/demote)
- Account actions (suspend, delete)
- Deletion request processing

### Analytics Dashboard

| Metric | Source |
|--------|--------|
| User Growth | `GET /api/admin/analytics/user-growth` |
| Revenue | `GET /api/admin/analytics/revenue` |
| Financial Overview | `GET /api/admin/analytics/financial-overview` |

### Moderation

- Property approval workflow
- Fraud detection and flagging
- Support ticket management
- Verification request processing

---

## Cross-Cutting Features

| Feature | All Roles |
|---------|-----------|
| **Notifications** | Push, in-app, email |
| **Profile** | Update, profile picture |
| **Settings** | Preferences, notifications |
| **Verification** | Phone, document |
