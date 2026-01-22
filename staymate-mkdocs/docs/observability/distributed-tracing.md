# Distributed Tracing

Request tracing across services.

---

## Future Implementation

```java
// Spring Cloud Sleuth
@Autowired
private Tracer tracer;

Span span = tracer.nextSpan().name("process-booking");
```

---

## Tools

| Tool | Purpose |
|------|---------|
| Zipkin | Trace visualization |
| Jaeger | Distributed tracing |
