# Module Design

Domain module organization patterns.

---

## Standard Module Structure

```
domain/{name}/
├── controller/     # REST endpoints
├── dto/            # Request/Response
├── entity/         # JPA entities
├── enums/          # Domain enums
├── mapper/         # Entity ↔ DTO
├── repository/     # Data access
└── service/        # Business logic
    └── impl/
```

---

## Module Inventory

| Module | Controllers | Services | Entities |
|--------|-------------|----------|----------|
| admin | 3 | 3 | 3 |
| booking | 1 | 1 | 1 |
| finance | 1 | 1 | 2 |
| messaging | 1 | 1 | 2 |
| property | 1 | 1 | 1 |
| user | 1 | 1 | 1 |
