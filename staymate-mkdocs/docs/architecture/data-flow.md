# Data Flow

Understanding how data moves through StayMate for key business operations.

---

## Booking Flow (Most Complex)

The booking process involves multiple domains and state transitions.

```mermaid
sequenceDiagram
    autonumber
    participant T as Tenant
    participant BC as BookingController
    participant BS as BookingService
    participant PS as PropertyService
    participant NS as NotificationService
    participant DB as Database
    participant L as Landlord

    T->>BC: POST /api/bookings
    BC->>BS: createBooking(request)
    BS->>PS: validatePropertyAvailable(propertyId)
    PS->>DB: SELECT * FROM properties WHERE id = ?
    DB-->>PS: Property entity
    PS-->>BS: Property available

    BS->>DB: INSERT INTO bookings (status = 'PENDING')
    DB-->>BS: Booking created

    BS->>NS: sendBookingNotification(landlord, booking)
    NS->>DB: INSERT INTO notifications
    NS-->>L: Push notification

    BS-->>BC: BookingResponse
    BC-->>T: 201 Created

    Note over L: Landlord reviews request

    L->>BC: PATCH /api/bookings/{id}/status
    BC->>BS: updateStatus(id, APPROVED)
    BS->>DB: UPDATE bookings SET status = 'APPROVED'

    BS->>NS: notifyTenant(booking)
    NS-->>T: Booking approved!
```

---

## Property Listing Flow

```mermaid
sequenceDiagram
    participant L as Landlord
    participant PC as PropertyController
    participant PS as PropertyService
    participant FS as FileStorageService
    participant MINIO as MinIO
    participant DB as MySQL

    L->>PC: POST /api/properties
    Note over L,PC: With images

    PC->>FS: uploadImages(files)
    FS->>MINIO: PUT objects
    MINIO-->>FS: URLs
    FS-->>PC: Image URLs

    PC->>PS: createProperty(request, imageUrls)
    PS->>DB: INSERT INTO properties
    DB-->>PS: Property ID

    PS-->>PC: PropertyResponse
    PC-->>L: 201 Created
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant AC as AuthController
    participant AS as AuthService
    participant US as UserService
    participant JWT as JwtTokenProvider
    participant DB as Database

    U->>AC: POST /api/auth/login
    AC->>AS: authenticate(email, password)
    AS->>US: findByEmail(email)
    US->>DB: SELECT * FROM users
    DB-->>US: User entity

    AS->>AS: BCrypt.verify(password, hash)

    alt Password invalid
        AS-->>U: 401 Unauthorized
    end

    AS->>JWT: generateAccessToken(user)
    JWT-->>AS: Access token (15 min)
    AS->>JWT: generateRefreshToken(user)
    JWT-->>AS: Refresh token (7 days)

    AS->>DB: UPDATE users SET last_login_at = NOW()

    AS-->>AC: AuthResponse
    AC-->>U: 200 OK + tokens
```

---

## Token Refresh Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AuthController
    participant JWT as JwtTokenProvider
    participant US as UserService
    participant DB as Database

    C->>AC: POST /api/auth/refresh-token
    Note over C,AC: Body: { refreshToken }

    AC->>JWT: validateToken(refreshToken)
    JWT->>JWT: Check signature
    JWT->>JWT: Check expiration
    JWT->>JWT: Verify type = "refresh"

    alt Token invalid
        JWT-->>C: 401 Unauthorized
    end

    JWT->>JWT: getUserIdFromToken()
    AC->>US: loadUserById(userId)
    US->>DB: SELECT * FROM users
    DB-->>US: User entity

    AC->>JWT: generateAccessToken(user)
    JWT-->>AC: New access token

    AC-->>C: 200 OK + new tokens
```

---

## Financial Flow

```mermaid
flowchart TD
    subgraph "Booking Complete"
        A[Check-out] --> B[Calculate Earnings]
    end

    subgraph "Landlord Actions"
        B --> C[Credit to Balance]
        C --> D[Payout Request]
        D --> E[Select Method]
    end

    subgraph "Admin Processing"
        E --> F[Admin Review]
        F --> G{Approve?}
        G -->|Yes| H[Mark Processed]
        G -->|No| I[Reject with Reason]
    end

    H --> J[Bank Transfer]
```

---

## Data Transformation

| Stage | Format |
|-------|--------|
| Request | JSON → DTO |
| Validation | DTO → Validated DTO |
| Mapping | DTO → Entity |
| Persistence | Entity → Database Row |
| Response | Entity → DTO → JSON |
