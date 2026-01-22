# Migrations

Flyway database migrations for StayMate.

---

## Overview

StayMate uses **Flyway** for version-controlled schema migrations.

```
src/main/resources/db/migration/
├── V1__init_schema.sql
├── V2__create_property_table.sql
├── V3_1__create_bookings_table.sql
├── ...
└── V120__alter_verification_requests_status.sql
```

---

## Migration Stats

| Metric | Value |
|--------|-------|
| Total Migrations | 55+ |
| Schema Version | V120 |
| Naming Convention | `V{version}__{description}.sql` |

---

## Key Migrations

| Version | Description |
|---------|-------------|
| V1 | Initial schema (users, roles) |
| V2 | Properties table |
| V3_1 | Bookings table |
| V11 | Roommate posts |
| V16 | Audit logs |
| V20 | Comprehensive demo seed data |
| V31 | Admin tables |
| V33 | Performance indexes |
| V112 | Auth performance indexes |

---

## Configuration

```properties
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db/migration
```

---

## Best Practices

!!! warning "Never Modify"
    Once a migration is applied, never modify it. Create a new migration instead.

```sql
-- V121__add_new_column.sql
ALTER TABLE properties ADD COLUMN featured BOOLEAN DEFAULT false;
```
