# Problem Statement

## The Housing Discovery Challenge

Finding and managing rental properties involves multiple disconnected systems, manual processes, and trust gaps.

---

## Core Problems

### 1. Fragmented Discovery

```mermaid
graph TD
    T[Tenant] --> P1[Platform A]
    T --> P2[Platform B]
    T --> P3[Social Media]
    T --> P4[Word of Mouth]

    P1 & P2 & P3 & P4 --> C[Confusion & Missed Opportunities]
```

**Impact**: Tenants waste hours searching across platforms; landlords miss potential tenants.

### 2. Trust Deficit

| Stakeholder | Trust Problem |
|-------------|---------------|
| Tenant | Is this landlord legitimate? Is the property real? |
| Landlord | Will this tenant pay? Are they who they claim? |
| Both | Is this platform secure? |

**Impact**: Scams, disputes, and abandoned bookings.

### 3. Manual Workflows

```mermaid
sequenceDiagram
    participant T as Tenant
    participant L as Landlord

    T->>L: Email inquiry
    L->>T: Reply with details
    T->>L: Request viewing
    L->>T: Schedule manually
    T->>L: Submit application (paper)
    L->>T: Request documents (email)
    T->>L: Send payment (bank transfer)
    L->>T: Confirm receipt
```

**Impact**: Slow turnaround, lost communications, no audit trail.

### 4. Roommate Matching Gap

- No integrated solution for finding compatible roommates
- Separate apps for housing vs. roommate search
- No unified messaging

---

## StayMate's Solution

| Problem | Solution |
|---------|----------|
| Fragmented discovery | Unified search with filters |
| Trust deficit | Verification system, reviews |
| Manual workflows | Automated booking lifecycle |
| Roommate gap | Integrated matching + messaging |

---

## Success Criteria

!!! success "We've succeeded when:"
    - A tenant can go from search → booking in under 10 minutes
    - Landlords manage all properties from a single dashboard
    - Admins can detect fraud before it impacts users
    - The platform achieves p95 response time < 500ms
