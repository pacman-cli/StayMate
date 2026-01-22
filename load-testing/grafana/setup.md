# Grafana Setup for StayMate Load Tests

## Overview

This guide helps you set up Grafana to visualize k6 load test metrics using Prometheus.

## Architecture

```
┌──────────┐     ┌────────────┐     ┌────────────┐
│   k6     │────▶│ Prometheus │────▶│  Grafana   │
│ (metrics)│     │  (storage) │     │ (dashboard)│
└──────────┘     └────────────┘     └────────────┘
```

## Prerequisites

- Docker & Docker Compose (recommended)
- Or: Prometheus and Grafana installed locally

## Quick Start with Docker

### 1. Create docker-compose.yml

```yaml
version: "3.8"

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--web.enable-remote-write-receiver"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  grafana-data:
```

### 2. Create prometheus.yml

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]
```

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Run k6 with Prometheus Output

```bash
K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write \
k6 run --out experimental-prometheus-rw main.js
```

## Access Grafana

1. Open http://localhost:3001
2. Login: admin / admin
3. Add Prometheus data source: http://prometheus:9090
4. Import the dashboard JSON from `dashboards/staymate-k6.json`

## Key Metrics to Monitor

| Metric | Description | Query |
|--------|-------------|-------|
| RPS | Requests per second | `rate(k6_http_reqs_total[1m])` |
| p95 Latency | 95th percentile response time | `histogram_quantile(0.95, rate(k6_http_req_duration_seconds_bucket[1m]))` |
| Error Rate | Percentage of failed requests | `rate(k6_http_req_failed_total[1m])` |
| VUs | Virtual users active | `k6_vus` |

## Interpreting Results

### Response Time Percentiles
- **p50 < 200ms**: Excellent
- **p95 < 500ms**: Good (meets SLA)
- **p95 > 500ms**: Needs optimization
- **p99 > 1000ms**: Critical bottleneck

### Error Rate
- **< 0.1%**: Excellent
- **< 1%**: Acceptable
- **> 1%**: Investigate immediately

### Saturation Indicators
- CPU > 80% on backend
- Memory > 85% usage
- Database connection pool exhausted
- Response times increasing while RPS flat
