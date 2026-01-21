# StayMate Load Test Analysis Report

> **Test Date:** January 19, 2026
> **Tool:** Locust
> **Max Users:** 10
> **Test Duration:** ~50 seconds

---

## 📊 Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total Requests | 24 | ⚠️ Low sample |
| Failures | 3 | 🔴 12.5% failure rate |
| Avg Response Time | 125ms | ✅ Good |
| 95th Percentile | 860ms | 🔴 Poor |
| Max RPS Achieved | ~2.5 | ⚠️ Low throughput |

---

## 🔴 Critical Issues

### 1. High Failure Rate (12.5%)
- **[Auth] Login** - 1 failure (0.14/s)
- **[Tenant] Create Roommate Post** - failures observed
- **Impact:** Users experiencing authentication failures

### 2. Extreme P95 Latency Spikes
- **[Auth] Register**: 860ms at 95th percentile (vs 170ms median)
- **Gap:** 5x difference between median and P95
- **Cause:** Likely database contention or unoptimized queries

### 3. Response Time Degradation Under Load
- Response times spike to **800ms+** as users increase
- System struggles with just 10 concurrent users
- Not production-ready for real traffic

---

## ⚠️ Performance Concerns

### Slow Endpoints (Median > 50ms)
| Endpoint | Median | P95 | Concern |
|----------|--------|-----|---------|
| [Auth] Login | 304ms | 300ms | 🔴 Very slow |
| [Auth] Register | 170ms | 860ms | 🔴 High variance |
| [Tenant] Check Conversations | 64ms | 64ms | ⚠️ Moderate |
| [Landlord] Received Applications | 68ms | 69ms | ⚠️ Moderate |

### Fast Endpoints (Good Performance)
| Endpoint | Median | Status |
|----------|--------|--------|
| [Landlord] My Reviews | 13ms | ✅ Good |
| [Landlord] Payout Methods | 15ms | ✅ Good |
| [Tenant] Search Properties | 21ms | ✅ Good |
| [Tenant] Get My Matches | 21ms | ✅ Good |

---

## 📈 Traffic Distribution Analysis

### User Type Breakdown (Ratio Per Class)
| User Type | Top Actions | Coverage |
|-----------|-------------|----------|
| **AdminUser** | dashboardMonitoring (16.7%), moderateProperties (12.5%) | Good |
| **LandlordUser** | manageBookings (14.8%), checkEarnings (11.1%) | Good |
| **TenantUser** | browseRoommates (10.7%), checkNotifications (10.7%) | Good |

✅ Test covers realistic user behavior patterns across all roles.

---

## 🛠️ Recommended Improvements

### Priority 1: Fix Authentication Performance
```
Issue: Login/Register endpoints are slowest
Action:
- Add database indexes on user lookup fields
- Implement password hashing async/caching
- Consider connection pooling optimization
```

### Priority 2: Reduce P95 Latency
```
Issue: 95th percentile 5x higher than median
Action:
- Profile slow queries with EXPLAIN ANALYZE
- Add Redis caching for frequent reads
- Implement query result pagination
```

### Priority 3: Increase Throughput Capacity
```
Issue: Only ~2.5 RPS with 10 users
Target: 50+ RPS for production
Action:
- Enable HikariCP connection pool tuning
- Implement async processing for heavy operations
- Consider horizontal scaling
```

### Priority 4: Fix Failure Sources
```
Issue: 12.5% failure rate
Action:
- Check application logs for error details
- Validate database constraints
- Add retry logic for transient failures
```

---

## 🎯 Performance Targets

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| Failure Rate | 12.5% | < 0.1% | 🔴 Critical |
| P95 Latency | 860ms | < 200ms | 🔴 High |
| Login Time | 304ms | < 100ms | 🔴 High |
| Max RPS | 2.5 | 50+ | ⚠️ Medium |
| Concurrent Users | 10 | 100+ | ⚠️ Medium |

---

## 📋 Next Steps

1. [x] Run profiler on Login/Register endpoints
2. [x] Add database query logging to identify slow queries
3. [ ] Implement caching layer (Redis) - Optional
4. [ ] Re-run load test with 50-100 users after fixes
5. [ ] Set up continuous performance monitoring

---

## ✅ Implemented Optimizations

### 1. Database Indexes (V112__performance_indexes_auth.sql)
```sql
-- User email index (CRITICAL for login)
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_email_status ON users (email, account_status);

-- Notification indexes
CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);

-- Roommate posts indexes
CREATE INDEX idx_roommate_posts_status ON roommate_posts (status);
```

### 2. Connection Pool Tuning (application.properties)
| Setting | Before | After | Impact |
|---------|--------|-------|--------|
| max-pool-size | 10 | 20 | +100% capacity |
| min-idle | 5 | 10 | Faster cold starts |
| idle-timeout | 5min | 30s | Better resource use |
| connection-timeout | 20s | 10s | Faster failure detection |

### 3. Hibernate Optimizations
- Enabled JDBC batching (batch_size=25)
- Ordered inserts/updates for batch efficiency
- Disabled SQL logging (reduces I/O overhead)

### 4. Logging Reduction
- Changed from DEBUG to WARN level
- Significantly reduces log I/O during high load

---

## 📸 Test Evidence
