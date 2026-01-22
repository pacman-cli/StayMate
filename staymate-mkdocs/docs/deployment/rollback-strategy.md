# Rollback Strategy

Recovery procedures for failed deployments.

---

## Docker Rollback

```bash
# Roll back to previous version
docker-compose down
docker-compose pull staymate-api:previous
docker-compose up -d
```

---

## Database Rollback

!!! warning "Flyway Limitation"
    Flyway doesn't support automatic rollback. Create forward migrations to undo changes.

```sql
-- V122__rollback_feature.sql
ALTER TABLE properties DROP COLUMN new_feature;
```
