# Bottlenecks

Identified performance constraints and mitigations.

---

## Known Bottlenecks

| Bottleneck | Impact | Mitigation |
|------------|--------|------------|
| N+1 queries | Slow list views | Fetch joins |
| Large uploads | Timeout | Chunked upload |
| DB connections | Pool exhaustion | HikariCP tuning |
