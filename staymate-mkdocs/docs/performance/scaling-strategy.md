# Scaling Strategy

Horizontal scaling approach for StayMate.

---

## Stateless Design

JWT-based auth enables horizontal scaling without shared sessions.

---

## Scaling Dimensions

| Component | Strategy |
|-----------|----------|
| API | Add replicas behind load balancer |
| Database | Read replicas, connection pooling |
| Storage | MinIO cluster |
