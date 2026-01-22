# Request Lifecycle

Every HTTP request to StayMate passes through a well-defined processing pipeline.

---

## Complete Request Flow

```mermaid
flowchart TD
    subgraph CLIENT["📱 Client"]
        REQ["HTTP Request"]
    end

    subgraph SECURITY["🔒 Security Layer"]
        CORS["CorsFilter<br/><small>Check allowed origins</small>"]
        RATE["RateLimitFilter<br/><small>Token bucket check</small>"]
        JWT["JwtAuthenticationFilter<br/><small>Validate Bearer token</small>"]
    end

    subgraph APP["⚙️ Application Layer"]
        CTRL["Controller<br/><small>@RestController</small>"]
        VALID["@Valid<br/><small>Bean Validation</small>"]
        AUTH["@PreAuthorize<br/><small>RBAC Check</small>"]
    end

    subgraph BIZ["💼 Business Layer"]
        SVC["Service<br/><small>@Transactional</small>"]
        MAP["Mapper<br/><small>Entity ↔ DTO</small>"]
    end

    subgraph DATA["💾 Data Layer"]
        REPO["Repository<br/><small>Spring Data JPA</small>"]
        DB[("MySQL<br/>Port 3306")]
    end

    REQ --> CORS
    CORS -->|"✅ Origin OK"| RATE
    CORS -->|"❌ Blocked"| REJECT1["403 Forbidden"]

    RATE -->|"✅ Under limit"| JWT
    RATE -->|"❌ Exceeded"| REJECT2["429 Too Many Requests"]

    JWT -->|"✅ Valid token"| CTRL
    JWT -->|"❌ Invalid/Missing"| REJECT3["401 Unauthorized"]

    CTRL --> VALID
    VALID -->|"❌ Invalid"| REJECT4["400 Bad Request"]
    VALID -->|"✅ Valid"| AUTH

    AUTH -->|"❌ No permission"| REJECT5["403 Forbidden"]
    AUTH -->|"✅ Authorized"| SVC

    SVC --> MAP
    MAP --> REPO
    REPO --> DB
    DB --> REPO
    REPO --> MAP
    MAP --> SVC
    SVC --> CTRL
    CTRL --> RESPONSE["HTTP Response"]

    style SECURITY fill:#e74c3c,color:#fff
    style APP fill:#3498db,color:#fff
    style BIZ fill:#2ecc71,color:#fff
    style DATA fill:#9b59b6,color:#fff
```

---

## Detailed Sequence

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant CORS as CorsFilter
    participant Rate as RateLimitFilter
    participant JWT as JwtAuthFilter
    participant Sec as SecurityContext
    participant Ctrl as Controller
    participant Valid as @Valid
    participant Svc as Service
    participant Repo as Repository
    participant DB as MySQL

    C->>CORS: HTTP Request
    Note over CORS: Check Origin header<br/>Match against allowed origins
    CORS->>Rate: Pass request

    Note over Rate: Get client identifier<br/>(userId or IP address)
    Rate->>Rate: TokenBucket.tryConsume()

    alt Rate limit exceeded
        Rate-->>C: 429 Too Many Requests
    end

    Rate->>JWT: Pass request
    Note over JWT: Extract "Bearer" token<br/>from Authorization header
    JWT->>JWT: jwtTokenProvider.validateToken()

    alt Token invalid or missing
        JWT-->>C: 401 Unauthorized
    end

    JWT->>JWT: getUserIdFromToken()
    JWT->>Sec: Set Authentication
    Note over Sec: UserPrincipal with<br/>roles and permissions

    Sec->>Ctrl: Dispatch to @RequestMapping
    Ctrl->>Valid: Validate @RequestBody

    alt Validation failed
        Valid-->>C: 400 Bad Request<br/>with field errors
    end

    Note over Ctrl: Check @PreAuthorize<br/>hasRole('HOUSE_OWNER')

    alt Not authorized
        Ctrl-->>C: 403 Forbidden
    end

    Ctrl->>Svc: Business method call
    Note over Svc: @Transactional begins
    Svc->>Repo: Repository method
    Repo->>DB: SQL Query
    DB-->>Repo: ResultSet
    Repo-->>Svc: Entity
    Note over Svc: @Transactional commits
    Svc-->>Ctrl: Response DTO
    Ctrl-->>C: 200 OK + JSON
```

---

## Filter Chain (Actual Code)

From `SecurityConfig.java`:

```java
// Lines 140-145
.addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
```

!!! note "Filter Order"
    Both filters run **before** `UsernamePasswordAuthenticationFilter`, but the order between them is determined by their `@Order` annotations. RateLimitFilter runs first.

---

## Rate Limit Details

From `RateLimitFilter.java`:

```mermaid
flowchart LR
    subgraph "Token Bucket Algorithm"
        REQ[Request] --> ID[Get Client ID]
        ID --> BUCKET["Get/Create Bucket<br/>(200 tokens max)"]
        BUCKET --> TRY{tryConsume?}
        TRY -->|"tokens > 0"| ALLOW[Allow Request]
        TRY -->|"tokens = 0"| DENY[429 Response]

        REFILL[Timer] -->|"3.33 tokens/sec"| BUCKET
    end
```

**Client Identification:**
1. Authenticated user: `user:{userId}`
2. Anonymous: `ip:{remoteAddr}` or `ip:{X-Forwarded-For}`

---

## JWT Validation Steps

From `JwtTokenProvider.java`:

```java
public boolean validateToken(String authToken) {
    try {
        Jwts.parser()
            .verifyWith(key)           // 1. Verify signature
            .build()
            .parseSignedClaims(token); // 2. Parse claims
        return true;                   // 3. Check expiration (auto)
    } catch (SignatureException ex) {
        logger.error("Invalid JWT signature");
    } catch (ExpiredJwtException ex) {
        logger.error("Expired JWT token");
    }
    // ... other exceptions
    return false;
}
```

---

## Transaction Boundaries

```mermaid
sequenceDiagram
    participant Controller
    participant Service
    participant Repo1 as PropertyRepo
    participant Repo2 as NotificationRepo
    participant DB as MySQL

    Controller->>Service: createProperty(request)

    rect rgb(200, 230, 200)
        Note over Service,DB: @Transactional scope
        Service->>Repo1: save(property)
        Repo1->>DB: INSERT INTO properties
        DB-->>Repo1: OK

        Service->>Repo2: save(notification)
        Repo2->>DB: INSERT INTO notifications
        DB-->>Repo2: OK

        Note over Service: Commit on return
    end

    Service-->>Controller: PropertyResponse
```

!!! warning "Notification Caveat"
    If notification save fails, the entire transaction rolls back including the property. Consider async notifications for non-critical cases.
