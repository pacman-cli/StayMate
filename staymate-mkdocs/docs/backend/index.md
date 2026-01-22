# Backend Internals

Deep dive into StayMate's backend implementation.

---

## Module Structure

Each domain follows a consistent pattern:

```
domain/{name}/
├── controller/      # REST endpoints
├── dto/             # Request/Response objects
├── entity/          # JPA entities
├── enums/           # Domain enumerations
├── mapper/          # Entity ↔ DTO conversion
├── repository/      # Data access
└── service/         # Business logic
    └── impl/        # Service implementations
```

---

## In This Section

| Document | Description |
|----------|-------------|
| [Module Design](module-design.md) | Domain organization |
| [Service Layer](service-layer.md) | Business logic patterns |
| [Repository Layer](repository-layer.md) | Data access |
| [DTO Mapping](dto-mapping.md) | Entity transformation |
| [Validation](validation.md) | Input validation |
| [Exception Handling](exception-handling.md) | Error management |

---

## Key Statistics

| Metric | Value |
|--------|-------|
| Domain Modules | 23 |
| Total Java Files | 300+ |
| Controllers | 25+ |
| Services | 30+ |
| Entities | 20+ |
