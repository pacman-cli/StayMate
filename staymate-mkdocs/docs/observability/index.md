# Observability

Logging, metrics, and monitoring for StayMate.

---

## Observability Stack

```mermaid
graph TB
    APP[Spring Boot] --> LOGS[Structured Logs]
    APP --> METRICS[Micrometer Metrics]
    APP --> HEALTH[Actuator Health]

    LOGS --> ELK[ELK Stack]
    METRICS --> PROM[Prometheus]
    PROM --> GRAF[Grafana]
```

---

## In This Section

| Document | Description |
|----------|-------------|
| [Metrics](metrics.md) | Application metrics |
| [Distributed Tracing](distributed-tracing.md) | Request tracing |
| [Alerts](alerts.md) | Alert configuration |
| [Dashboards](dashboards.md) | Grafana dashboards |

---

## Quick Access

| Endpoint | Purpose |
|----------|---------|
| `/actuator/health` | Health check |
| `/actuator/metrics` | Metrics list |
| `/actuator/prometheus` | Prometheus scrape |
