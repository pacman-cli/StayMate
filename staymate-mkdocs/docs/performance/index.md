# Performance

Performance optimization and scalability strategies.

---

## Performance Model

```mermaid
flowchart LR
    subgraph Targets["Targets"]
        P95["p95 < 500ms"]
        P99["p99 < 1000ms"]
        ERR["Error < 1%"]
    end

    subgraph Optimizations["Optimizations"]
        POOL["Connection Pool"]
        INDEX["DB Indexes"]
        ASYNC["Async Processing"]
    end
```

---

## In This Section

| Document | Description |
|----------|-------------|
| [Load Testing](load-testing.md) | JMeter & k6 setup |
| [Async Processing](async-processing.md) | Background jobs |
| [Scaling Strategy](scaling-strategy.md) | Horizontal scaling |
| [Bottlenecks](bottlenecks.md) | Identified constraints |

---

## SLA Targets

| Metric | Target | Current |
|--------|--------|---------|
| p95 Response | < 500ms | ✅ |
| p99 Response | < 1000ms | ✅ |
| Error Rate | < 1% | ✅ |
| Throughput | > 100 RPS | ✅ |
