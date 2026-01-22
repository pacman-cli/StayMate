# Metrics

Application metrics with Micrometer.

---

## Built-in Metrics

| Metric | Description |
|--------|-------------|
| `http.server.requests` | Request counts and timing |
| `jvm.memory.used` | JVM memory |
| `hikaricp.connections.active` | DB connections |

---

## Endpoint

```
GET /actuator/metrics
```
