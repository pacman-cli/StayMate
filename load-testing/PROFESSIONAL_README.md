# StayMate Load Testing Suite

> **Production-Grade Load Testing Infrastructure for StayMate Backend**

[![JMeter](https://img.shields.io/badge/JMeter-5.6.3-red.svg)](https://jmeter.apache.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black.svg)](https://nextjs.org/)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Architecture](#-architecture)
4. [Load Testing Strategy](#-load-testing-strategy)
5. [Prerequisites](#-prerequisites)
6. [Quick Start](#-quick-start)
7. [Test Scenarios](#-test-scenarios)
8. [Performance Metrics](#-performance-metrics)
9. [Running Tests](#-running-tests)
10. [Results Analysis](#-results-analysis)
11. [Common Issues & Fixes](#-common-issues--fixes)
12. [CI/CD Integration](#cicd-integration)

---

## 🎯 Project Overview

StayMate is a comprehensive roommate and property matching platform that requires robust performance testing to ensure optimal user experience under load. This load testing suite simulates real-world user behavior patterns across different user roles (Tenants, Landlords, Admins) to identify performance bottlenecks and validate scalability.

### Key Performance Requirements

- **Response Time**: < 500ms for 95% of requests
- **Throughput**: 100+ concurrent users
- **Availability**: 99.9% uptime
- **Error Rate**: < 1% under normal load

---

## 🛠 Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Database**: MySQL 8.0 with HikariCP connection pooling
- **Authentication**: JWT with OAuth2 (Google)
- **File Storage**: MinIO (S3-compatible)
- **API**: RESTful with WebSocket support

### Frontend
- **Framework**: Next.js 14.0.0
- **UI**: React 18 with TypeScript
- **Styling**: Tailwind CSS

### Load Testing
- **Tool**: Apache JMeter 5.6.3
- **Data**: CSV-based test data
- **Reporting**: HTML dashboard with detailed metrics

---

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   JMeter Client │    │   JMeter Client │    │   JMeter Client │
│   (Local/EC2)   │    │   (Local/EC2)   │    │   (Local/EC2)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │   Load Balancer (ALB)     │
                    │   SSL Termination         │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │   Spring Boot Backend      │
                    │   Port 8080                │
                    │   JWT Authentication       │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────┴───────┐    ┌─────────┴───────┐    ┌─────────┴───────┐
│   MySQL RDS     │    │   MinIO S3      │    │   Redis Cache   │
│   (Primary)     │    │   File Storage  │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📊 Load Testing Strategy

### User Role Distribution

- **Tenants (60%)**: Property browsing, booking, messaging
- **Landlords (30%)**: Property management, booking requests
- **Admins (10%)**: Analytics, user management, reports

### Test Types

1. **Baseline Test**: 10 users, establish performance baseline
2. **Load Test**: 50 users, normal operating conditions
3. **Stress Test**: 100 users, identify breaking points
4. **Spike Test**: Sudden load increase, test recovery
5. **Endurance Test**: Sustained load over extended period

### Key API Endpoints Tested

#### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user profile

#### Properties
- `GET /api/properties` - Browse properties
- `GET /api/properties/search` - Search properties
- `GET /api/properties/{id}` - Property details
- `POST /api/properties` - Create property (landlords)

#### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - User bookings
- `GET /api/bookings/requests` - Booking requests (landlords)

#### Messaging
- `GET /api/messages/conversations` - Get conversations
- `POST /api/messages/send` - Send message

#### Analytics
- `GET /api/dashboard/user` - User dashboard
- `GET /api/dashboard/landlord` - Landlord dashboard
- `GET /api/admin/analytics/*` - Admin analytics

---

## ✅ Prerequisites

### System Requirements

- **Java**: JDK 11 or higher
- **JMeter**: Apache JMeter 5.6.3
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Network**: Stable internet connection

### Application Setup

1. **StayMate Backend**: Running and accessible
2. **Database**: MySQL with test data populated
3. **Test Users**: Created in database (see CSV files)

### Test Data Preparation

Ensure test users exist in your database:

```sql
-- Example test user creation
INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at) VALUES
('loadtest_tenant_001@test.com', '$2a$10$...', 'Test', 'Tenant001', 'TENANT', NOW(), NOW()),
('loadtest_landlord_001@test.com', '$2a$10$...', 'Test', 'Landlord001', 'LANDLORD', NOW(), NOW()),
('mpuspo2310304@bscse.uiu.ac.bd', '$2a$10$...', 'Admin', 'User', 'ADMIN', NOW(), NOW());
```

---

## 🚀 Quick Start

### 1. Install JMeter

```bash
# macOS
brew install jmeter

# Ubuntu/Debian
sudo apt update && sudo apt install jmeter

# Windows
# Download from https://jmeter.apache.org/download_jmeter.cgi
```

### 2. Navigate to Load Testing Directory

```bash
cd /Users/puspo/Desktop/SOFTWARE_PROJECT/StayMate/load-testing/jmeter
```

### 3. Configure Test Environment

Edit the JMX file or set environment variables:

```bash
# For local testing
export BASE_URL=localhost
export PORT=8080

# For production testing
export BASE_URL=your-domain.com
export PORT=443
```

### 4. Run Basic Test

```bash
# GUI Mode (for development/debugging)
jmeter -t staymate-load-test.jmx

# Non-GUI Mode (for production testing)
jmeter -n -t staymate-load-test.jmx -l results/load-test-results.jtl -o reports/load-test-report/
```

### 5. View Results

Open the generated HTML report:
```bash
open reports/load-test-report/index.html
```

---

## 🧪 Test Scenarios

### Scenario 1: Baseline Performance Test

**Purpose**: Establish performance baseline
- **Users**: 10 concurrent
- **Duration**: 2 minutes
- **Ramp-up**: 30 seconds
- **Expected**: < 200ms response time, 0% errors

### Scenario 2: Normal Load Test

**Purpose**: Validate performance under normal load
- **Users**: 50 concurrent (30 tenants, 15 landlords, 5 admins)
- **Duration**: 5 minutes
- **Ramp-up**: 60 seconds
- **Expected**: < 500ms response time, < 1% errors

### Scenario 3: Stress Test

**Purpose**: Identify breaking points
- **Users**: 100 concurrent
- **Duration**: 10 minutes
- **Ramp-up**: 120 seconds
- **Expected**: Monitor degradation, identify bottlenecks

### Scenario 4: Spike Test

**Purpose**: Test recovery from sudden load spikes
- **Users**: 20 → 100 → 20 (within 2 minutes)
- **Duration**: 5 minutes
- **Pattern**: Sudden increase and decrease
- **Expected**: System should recover gracefully

---

## 📈 Performance Metrics

### Key Indicators

| Metric | Target | Good | Warning | Critical |
|--------|--------|------|---------|----------|
| Response Time (95th percentile) | < 500ms | < 200ms | 200-500ms | > 500ms |
| Throughput | > 100 req/s | > 200 req/s | 100-200 req/s | < 100 req/s |
| Error Rate | < 1% | < 0.5% | 0.5-1% | > 1% |
| CPU Usage | < 80% | < 60% | 60-80% | > 80% |
| Memory Usage | < 80% | < 60% | 60-80% | > 80% |
| Database Connections | < 80% of pool | < 60% | 60-80% | > 80% |

### Monitoring Points

1. **Application Layer**
   - API response times
   - Error rates by endpoint
   - Authentication success/failure

2. **Database Layer**
   - Query execution times
   - Connection pool usage
   - Database locks and waits

3. **Infrastructure Layer**
   - CPU and memory utilization
   - Network I/O
   - Disk I/O

---

## 🏃 Running Tests

### Command Line Options

```bash
# Basic test run
jmeter -n -t staymate-load-test.jmx -l results/test-results.jtl

# With HTML report generation
jmeter -n -t staymate-load-test.jmx -l results/test-results.jtl -o reports/test-report/

# With custom properties
jmeter -n -t staymate-load-test.jmx \
  -JBASE_URL=production-domain.com \
  -JPORT=443 \
  -Jusers=50 \
  -Jrampup=60 \
  -l results/prod-test-results.jtl \
  -o reports/prod-test-report/

# Distributed testing (multiple JMeter instances)
jmeter -n -t staymate-load-test.jmx \
  -R server1,server2,server3 \
  -l results/distributed-test-results.jtl
```

### Test Execution Script

Create `run-tests.sh`:

```bash
#!/bin/bash

# Configuration
TEST_PLAN="staymate-load-test.jmx"
RESULTS_DIR="results"
REPORTS_DIR="reports"
BASE_URL=${BASE_URL:-localhost}
PORT=${PORT:-8080}

# Create directories
mkdir -p $RESULTS_DIR $REPORTS_DIR

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULTS_FILE="$RESULTS_DIR/test-results-$TIMESTAMP.jtl"
REPORT_DIR="$REPORTS_DIR/test-report-$TIMESTAMP"

echo "Starting load test..."
echo "Target: $BASE_URL:$PORT"
echo "Results: $RESULTS_FILE"
echo "Report: $REPORT_DIR"

# Run test
jmeter -n -t $TEST_PLAN \
  -JBASE_URL=$BASE_URL \
  -JPORT=$PORT \
  -l $RESULTS_FILE \
  -o $REPORT_DIR

echo "Test completed. Report available at: $REPORT_DIR/index.html"
```

---

## 📊 Results Analysis

### Understanding HTML Reports

1. **Dashboard Overview**
   - Overall test statistics
   - Response time distribution
   - Throughput over time
   - Error rate analysis

2. **Detailed Metrics**
   - Response times by percentile
   - Throughput by endpoint
   - Error analysis
   - Thread group performance

3. **Charts and Graphs**
   - Response time trends
   - Active threads over time
   - Bytes throughput
   - Latency vs. throughput

### Key Performance Indicators

#### Response Time Analysis
```bash
# Extract 95th percentile from JTL file
grep -o '"rt":[0-9]*' results/test-results.jtl | \
  sort -n | \
  awk 'BEGIN{count=0} {times[count++]=$2} END{print "95th percentile:", times[int(count*0.95)]}'
```

#### Error Rate Calculation
```bash
# Calculate error rate
total=$(wc -l < results/test-results.jtl)
errors=$(grep '"success":false' results/test-results.jtl | wc -l)
error_rate=$(echo "scale=2; $errors * 100 / $total" | bc)
echo "Error rate: $error_rate%"
```

---

## 🔧 Common Issues & Fixes

### Issue 1: Connection Timeouts

**Symptoms**: High error rate, connection refused errors

**Causes**:
- Database connection pool exhausted
- Server overloaded
- Network issues

**Fixes**:
```properties
# Increase database connection pool
spring.datasource.hikari.maximum-pool-size=50
spring.datasource.hikari.minimum-idle=20

# Increase server threads
server.tomcat.threads.max=200
server.tomcat.threads.min-spare=20
```

### Issue 2: Memory Leaks

**Symptoms**: Increasing memory usage, OutOfMemoryError

**Causes**:
- Unbounded collections
- Improper resource cleanup
- Large session objects

**Fixes**:
```bash
# Increase heap size
export JAVA_OPTS="-Xmx4g -Xms2g -XX:+UseG1GC"

# Monitor memory usage
jstat -gc -t $(pgrep java) 5s
```

### Issue 3: Slow Database Queries

**Symptoms**: High database response times

**Causes**:
- Missing indexes
- Inefficient queries
- Database locks

**Fixes**:
```sql
-- Add indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_properties_location ON properties(city, state);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Monitor slow queries
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
```

### Issue 4: Authentication Failures

**Symptoms**: 401 Unauthorized errors

**Causes**:
- JWT token expiration
- Concurrent login issues
- Rate limiting

**Fixes**:
```properties
# Increase JWT expiration
app.jwt.access-token-expiration-ms=1800000
app.jwt.refresh-token-expiration-ms=604800000

# Adjust rate limiting
rate.limit.requests-per-minute=120
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Load Testing

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  load-test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up JDK 11
      uses: actions/setup-java@v3
      with:
        java-version: '11'
        distribution: 'temurin'

    - name: Download JMeter
      run: |
        wget https://downloads.apache.org//jmeter/binaries/apache-jmeter-5.6.3.tgz
        tar -xzf apache-jmeter-5.6.3.tgz

    - name: Wait for application
      run: |
        timeout 300 bash -c 'until curl -f http://localhost:8080/actuator/health; do sleep 5; done'

    - name: Run Load Test
      run: |
        apache-jmeter-5.6.3/bin/jmeter -n \
          -t load-testing/jmeter/staymate-load-test.jmx \
          -JBASE_URL=localhost \
          -JPORT=8080 \
          -l load-test-results.jtl \
          -o load-test-report/

    - name: Upload Results
      uses: actions/upload-artifact@v3
      with:
        name: load-test-report
        path: load-test-report/

    - name: Check Performance Thresholds
      run: |
        # Add custom checks here
        echo "Performance validation completed"
```

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any

    stages {
        stage('Setup') {
            steps {
                sh 'wget https://downloads.apache.org//jmeter/binaries/apache-jmeter-5.6.3.tgz'
                sh 'tar -xzf apache-jmeter-5.6.3.tgz'
            }
        }

        stage('Load Test') {
            steps {
                sh '''
                    apache-jmeter-5.6.3/bin/jmeter -n \
                      -t load-testing/jmeter/staymate-load-test.jmx \
                      -JBASE_URL=staging-domain.com \
                      -JPORT=443 \
                      -l results.jtl \
                      -o report/
                '''
            }
        }

        stage('Analyze Results') {
            steps {
                sh '''
                    # Parse results and fail if thresholds exceeded
                    python scripts/analyze-results.py results.jtl
                '''
            }
        }
    }

    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'report',
                reportFiles: 'index.html',
                reportName: 'Load Test Report'
            ])
        }
    }
}
```

---

## 📝 Best Practices

### Test Data Management
- Use realistic test data
- Rotate test credentials regularly
- Clean up test data after runs
- Use separate test database

### Performance Monitoring
- Monitor during tests
- Set up alerts for threshold breaches
- Log detailed metrics
- Use APM tools (New Relic, DataDog)

### Test Environment
- Mirror production environment
- Use production-like data volumes
- Test with realistic network conditions
- Include caching layers

### Continuous Improvement
- Regular performance regression testing
- Baseline updates after major changes
- Performance budget enforcement
- Team training on performance

---

## 🆘 Troubleshooting Guide

### Quick Diagnostics

```bash
# Check system resources
top
free -h
df -h

# Check application health
curl -f http://localhost:8080/actuator/health

# Check database connections
mysql -h localhost -u root -p -e "SHOW PROCESSLIST;"

# Monitor network connections
netstat -an | grep :8080
```

### Performance Tuning Checklist

- [ ] Database indexes optimized
- [ ] Connection pools sized correctly
- [ ] Caching implemented
- [ ] Compression enabled
- [ ] CDN configured
- [ ] Load balancer optimized
- [ ] Monitoring in place
- [ ] Alerts configured

---

## 📞 Support

For issues and questions:
1. Check this README first
2. Review JMeter logs
3. Examine application logs
4. Consult team performance engineer

---

## 📄 License

This load testing suite is part of the StayMate project. See main project license for details.

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Maintainer**: StayMate Performance Team
