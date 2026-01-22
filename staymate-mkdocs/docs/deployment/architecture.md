# Deployment Architecture

Production deployment topology.

---

## Architecture

```mermaid
graph TB
    LB[Load Balancer]
    subgraph "API Cluster"
        API1[API 1]
        API2[API 2]
    end
    subgraph "Data"
        DB[(MySQL)]
        MINIO[MinIO]
    end

    LB --> API1
    LB --> API2
    API1 & API2 --> DB
    API1 & API2 --> MINIO
```

---

## Components

| Component | Purpose |
|-----------|---------|
| Load Balancer | Traffic distribution |
| API Instances | Stateless services |
| MySQL | Primary database |
| MinIO | Object storage |
