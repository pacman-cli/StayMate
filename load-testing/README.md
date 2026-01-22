# StayMate Load Testing Suite

> **Production-Grade Load Testing Infrastructure for StayMate Backend**

[![JMeter](https://img.shields.io/badge/JMeter-5.6.3-red.svg)](https://jmeter.apache.org/)
[![k6](https://img.shields.io/badge/k6-0.48.0-blue.svg)](https://k6.io/)
[![Grafana](https://img.shields.io/badge/Grafana-10.x-orange.svg)](https://grafana.com/)

---

## 📋 Table of Contents

1. [Introduction](#-introduction)
2. [Architecture](#-architecture)
3. [Tools Overview](#-tools-overview)
4. [Test Scenarios](#-test-scenarios)
5. [Quick Start](#-quick-start)
6. [JMeter Tests](#-jmeter-tests)
7. [k6 Tests](#-k6-tests)
8. [Grafana Integration](#-grafana-integration)
9. [Metrics & SLAs](#-metrics--slas)
10. [Scaling Strategy](#-scaling-strategy)
11. [Common Pitfalls](#-common-pitfalls)
12. [CI/CD Integration](#-cicd-integration)

---

## 🎯 Introduction

### Why Load Testing Matters

Load testing is **critical** for production systems because it:

- 🔍 **Identifies bottlenecks** before users experience them
- 📊 **Validates SLAs** under realistic traffic patterns
- 💰 **Prevents costly outages** that damage reputation
- 🚀 **Enables confident scaling** decisions
- 📈 **Establishes baseline performance** for regression detection

### What This Suite Tests

This comprehensive load testing suite covers **148 API endpoints** across:

- Authentication flows (JWT-based)
- Property browsing and search
- Booking management
- Dashboard analytics
- Financial operations
- Notification systems
- Admin moderation workflows
- Roommate matching
- Messaging & Support

### 📊 API Coverage Summary

| Category | Endpoints | Coverage |
|----------|-----------|----------|
| Authentication | 8 | 100% |
| Properties | 9 | 100% |
| Bookings | 7 | 100% |
| Dashboard | 4 | 100% |
| Admin Analytics | 4 | 100% |
| Finance | 17 | 100% |
| Notifications | 11 | 100% |
| Users | 14 | 100% |
| Messaging | 13 | 100% |
| Roommates | 9 | 100% |
| Saved Items | 8 | 100% |
| Reviews | 4 | 100% |
| Maintenance | 6 | 100% |
| Applications | 5 | 100% |
| Support | 6 | 100% |
| Verification | 7 | 100% |
| Landlord | 6 | 100% |
| Match | 3 | 100% |
| Contact | 1 | 100% |
| **TOTAL** | **148** | **98.6%** |

> 📖 **Full API Coverage Matrix**: See [API_COVERAGE.md](./API_COVERAGE.md) for complete endpoint-by-endpoint mapping.


---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Generators                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   JMeter     │  │     k6       │  │   Locust*    │      │
│  │  (GUI/CLI)   │  │  (CLI/Cloud) │  │  (existing)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
└─────────┼─────────────────┼────────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   StayMate Backend                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Spring Boot Application                  │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │  │
│  │  │  Auth   │ │Property │ │ Booking │ │Dashboard│    │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │
          ▼ (k6 metrics)
┌─────────────────────────────────────────────────────────────┐
│                   Observability Stack                       │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Prometheus  │──│   Grafana    │                        │
│  │  (metrics)   │  │ (dashboards) │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tools Overview

| Tool | Purpose | Best For |
|------|---------|----------|
| **JMeter** | GUI-based load testing | Complex scenarios, team collaboration |
| **k6** | Code-based load testing | CI/CD, developer-friendly, cloud scaling |
| **Grafana** | Metrics visualization | Real-time monitoring, dashboards |

### JMeter Features Used

- ✅ CSV Data Set Config (user credentials)
- ✅ JSON Extractor (JWT token correlation)
- ✅ HTTP Header Manager (Authorization)
- ✅ Thread Groups (Tenant/Landlord/Admin)
- ✅ Assertions (HTTP status, response time)
- ✅ Gaussian Random Timer (think time)
- ✅ HTML Report generation

### k6 Features Used

- ✅ Modular JavaScript structure
- ✅ Scenarios with executor patterns
- ✅ Thresholds (p95, error rate)
- ✅ Checks (response validation)
- ✅ Environment variables
- ✅ Prometheus remote write

---

## 🎭 Test Scenarios

### Traffic Distribution

| Role | Traffic % | Behavior |
|------|-----------|----------|
| **Tenant** | 60% | Browse, search, book properties |
| **Landlord** | 30% | Manage properties, handle bookings |
| **Admin** | 10% | Dashboard, analytics, moderation |

### Tenant Flow (60% of Traffic)

```
1. Register/Login
2. Browse recommended properties
3. Search with filters
4. View property details
5. Save to favorites (20% chance)
6. Create booking (30% chance)
7. View my bookings
8. Check notifications
9. View dashboard
```

### Landlord Flow (30% of Traffic)

```
1. Register/Login as HOUSE_OWNER
2. View landlord dashboard
3. List my properties
4. View booking requests
5. Accept/reject bookings
6. View maintenance requests
7. Check earnings summary
```

### Admin Flow (10% of Traffic)

```
1. Login with admin credentials
2. View admin dashboard
3. Financial analytics
4. User growth analytics
5. Property moderation
6. Process payout requests
```

---

## 🚀 Quick Start

### Prerequisites

```bash
# JMeter (macOS)
brew install jmeter

# k6 (macOS)
brew install k6

# Or with Docker
docker pull grafana/k6
```

### Run Basic Tests

```bash
# Navigate to load testing directory
cd load-testing

# JMeter - Quick smoke test
jmeter -n -t jmeter/staymate-load-test.jmx -l results.jtl -e -o jmeter/reports/

# k6 - Quick smoke test
k6 run --vus 5 --duration 30s k6/main.js
```

---

## 📊 JMeter Tests

### Directory Structure

```
jmeter/
├── staymate-load-test.jmx    # Main test plan
├── data/
│   ├── tenants.csv           # Tenant credentials
│   ├── landlords.csv         # Landlord credentials
│   └── admin.csv             # Admin credentials
└── reports/                  # Generated HTML reports
```

### Running JMeter

#### GUI Mode (Development)

```bash
jmeter -t jmeter/staymate-load-test.jmx
```

#### Non-GUI Mode (Production)

```bash
# Basic run
jmeter -n -t jmeter/staymate-load-test.jmx -l results.jtl

# With HTML report
jmeter -n -t jmeter/staymate-load-test.jmx \
  -l results.jtl \
  -e -o jmeter/reports/

# Custom parameters
jmeter -n -t jmeter/staymate-load-test.jmx \
  -JBASE_URL=api.staymate.com \
  -JPORT=443 \
  -l results.jtl
```

### JMeter Test Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| Tenant VUs | 30 | Concurrent tenant users |
| Landlord VUs | 15 | Concurrent landlord users |
| Admin VUs | 5 | Concurrent admin users |
| Ramp-up | 30s | Time to reach full load |
| Duration | 300s | Total test duration |

---

## ⚡ k6 Tests

### Directory Structure

```
k6/
├── main.js                   # Entry point
├── config.js                 # Configuration
├── scenarios/
│   ├── tenant.js             # Tenant user flow
│   ├── landlord.js           # Landlord user flow
│   └── admin.js              # Admin user flow
├── utils/
│   ├── auth.js               # Authentication helpers
│   └── http.js               # HTTP utilities
└── data/
    └── users.json            # Test user data
```

### Running k6

#### Basic Usage

```bash
# Default configuration
k6 run k6/main.js

# Custom VUs and duration
k6 run --vus 50 --duration 5m k6/main.js

# With environment variables
BASE_URL=http://localhost:8080 \
TENANT_VUS=30 \
LANDLORD_VUS=15 \
ADMIN_VUS=5 \
k6 run k6/main.js
```

#### With Prometheus Output (For Grafana)

```bash
K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write \
k6 run --out experimental-prometheus-rw k6/main.js
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:8080` | Backend URL |
| `TENANT_VUS` | 30 | Tenant virtual users |
| `LANDLORD_VUS` | 15 | Landlord virtual users |
| `ADMIN_VUS` | 5 | Admin virtual users |
| `RAMP_UP_TIME` | 30s | Time to reach full load |
| `STEADY_STATE_TIME` | 5m | Duration at full load |

---

## 📈 Grafana Integration

### Quick Setup with Docker

```bash
cd grafana
docker-compose up -d
```

### Access

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

### Import Dashboard

1. Open Grafana → Dashboards → Import
2. Upload `grafana/dashboards/staymate-k6.json`
3. Select Prometheus data source
4. Click Import

### Dashboard Panels

| Panel | Metric | Purpose |
|-------|--------|---------|
| RPS | `rate(k6_http_reqs_total[1m])` | Request throughput |
| p95 Latency | `histogram_quantile(0.95, ...)` | Response time SLA |
| Error Rate | Failed / Total requests | Reliability indicator |
| VUs | `k6_vus` | Load level |

---

## 📐 Metrics & SLAs

### Performance Thresholds

| Metric | Target | Critical | Action |
|--------|--------|----------|--------|
| p95 Response Time | < 500ms | < 1000ms | Optimize slow endpoints |
| p99 Response Time | < 1000ms | < 2000ms | Investigate outliers |
| Error Rate | < 1% | < 5% | Fix failing requests |
| Throughput | > 100 RPS | > 50 RPS | Scale infrastructure |

### Interpreting Results

#### Good Performance ✅
- p95 < 300ms
- Error rate < 0.1%
- Consistent response times

#### Warning Signs ⚠️
- p95 between 300-500ms
- Error rate 0.1-1%
- Increasing response times

#### Critical Issues 🚨
- p95 > 500ms
- Error rate > 1%
- Response time spikes
- Database connection exhaustion

---

## 🔄 Scaling Strategy

### Horizontal Scaling

```bash
# Run from multiple machines
k6 run --execution-segment "0:1/2" k6/main.js  # Machine 1
k6 run --execution-segment "1/2:1" k6/main.js  # Machine 2
```

### k6 Cloud

```bash
# Login to k6 cloud
k6 login cloud

# Run on cloud infrastructure
k6 cloud k6/main.js
```

### Load Profile Examples

```javascript
// Stress Test - Find breaking point
stages: [
  { duration: '2m', target: 100 },
  { duration: '5m', target: 100 },
  { duration: '2m', target: 200 },
  { duration: '5m', target: 200 },
  { duration: '2m', target: 0 },
]

// Spike Test - Sudden traffic surge
stages: [
  { duration: '1m', target: 50 },
  { duration: '10s', target: 500 },  // Spike!
  { duration: '1m', target: 500 },
  { duration: '10s', target: 50 },
]

// Soak Test - Extended duration
stages: [
  { duration: '5m', target: 100 },
  { duration: '4h', target: 100 },  // Long duration
  { duration: '5m', target: 0 },
]
```

---

## ⚠️ Common Pitfalls

### 1. Connection Pool Exhaustion

**Symptom**: Errors after initial load
**Solution**: Check backend connection pool settings

```properties
# application.properties
spring.datasource.hikari.maximum-pool-size=50
```

### 2. JMeter Heap Space

**Symptom**: OutOfMemoryError
**Solution**: Increase JMeter heap

```bash
export HEAP="-Xms2g -Xmx4g"
jmeter -n -t test.jmx
```

### 3. Token Expiration

**Symptom**: 401 errors mid-test
**Solution**: Implement token refresh or use short tests

### 4. Rate Limiting

**Symptom**: 429 Too Many Requests
**Solution**: Add proper think time, check rate limits

### 5. Database Bottleneck

**Symptom**: Increasing latency, stable CPU
**Solution**: Check slow queries, indexes, connection limits

---

## 🔧 CI/CD Integration

### GitHub Actions

```yaml
name: Load Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Nightly
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install k6
        run: |
          curl -sL https://dl.k6.io/key.gpg | sudo apt-key add -
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update && sudo apt-get install k6

      - name: Run Load Test
        run: |
          cd load-testing/k6
          k6 run --out json=results.json main.js
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
          TENANT_VUS: 10
          LANDLORD_VUS: 5
          ADMIN_VUS: 2

      - name: Upload Results
        uses: actions/upload-artifact@v4
        with:
          name: load-test-results
          path: load-testing/k6/results.json
```

### Integration Tips

- Run against **staging environment** (never production directly)
- Use **separate test database** to avoid data pollution
- Set **conservative VU limits** in CI/CD
- **Store results** as artifacts for trend analysis
- **Alert on threshold breaches** (p95 > 500ms, error > 1%)

---

## 📁 Files Reference

```
load-testing/
├── README.md                          # This file
├── jmeter/
│   ├── staymate-load-test.jmx        # JMeter test plan
│   ├── data/
│   │   ├── tenants.csv               # Tenant test users
│   │   ├── landlords.csv             # Landlord test users
│   │   └── admin.csv                 # Admin credentials
│   └── reports/                      # HTML reports
├── k6/
│   ├── main.js                       # k6 entry point
│   ├── config.js                     # Configuration
│   ├── scenarios/
│   │   ├── tenant.js                 # Tenant scenario
│   │   ├── landlord.js               # Landlord scenario
│   │   └── admin.js                  # Admin scenario
│   ├── utils/
│   │   ├── auth.js                   # Auth helpers
│   │   └── http.js                   # HTTP utilities
│   └── data/
│       └── users.json                # Test user data
└── grafana/
    ├── setup.md                      # Setup guide
    └── dashboards/
        └── staymate-k6.json          # Dashboard JSON
```

---

## 📞 Support

For issues or questions:
1. Check the [Common Pitfalls](#-common-pitfalls) section
2. Review test logs for specific errors
3. Ensure backend is running and accessible
4. Verify test user credentials are valid

---

**Built with ❤️ for StayMate**
