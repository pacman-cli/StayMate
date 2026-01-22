# Alerts

Alerting configuration for monitoring.

---

## Recommended Alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| High Error Rate | > 5% 5xx | Critical |
| Slow Response | p95 > 1s | Warning |
| DB Pool Exhausted | > 90% used | Critical |
