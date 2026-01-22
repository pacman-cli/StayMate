# Common Errors

Troubleshooting guide for frequent issues.

---

## Database Errors

### Connection Refused

```
com.mysql.cj.jdbc.exceptions.CommunicationsException:
Communications link failure
```

**Cause:** MySQL is not running.

**Fix:**
```bash
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql

# Verify
mysql -u root -p -e "SELECT 1;"
```

---

### Access Denied

```
Access denied for user 'root'@'localhost' (using password: YES)
```

**Cause:** Wrong password or user doesn't exist.

**Fix:**
```bash
# Reset password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
EXIT;

# Update environment
export DB_PASSWORD=new_password
```

---

### Database Not Found

```
Unknown database 'authdb'
```

**Cause:** Database doesn't exist.

**Fix:**
```bash
mysql -u root -p -e "CREATE DATABASE authdb;"
```

---

## Flyway Errors

### Migration Checksum Mismatch

```
FlywayException: Validate failed: Migration checksum mismatch
```

**Cause:** Migration file was modified after being applied.

**Fix (Development Only):**
```bash
# WARNING: This deletes migration history
mysql -u root -p authdb -e "DROP TABLE flyway_schema_history;"

# Restart application - migrations will re-run
./mvnw spring-boot:run
```

!!! danger "Production Warning"
    Never do this in production. Instead, create a new migration.

---

## JWT Errors

### Invalid JWT Signature

```
io.jsonwebtoken.security.SignatureException: JWT signature does not match
```

**Cause:** JWT_SECRET changed between token generation and validation.

**Fix:**
- Use consistent JWT_SECRET
- Clear browser tokens and re-login

---

### Expired JWT Token

```
io.jsonwebtoken.ExpiredJwtException: JWT expired
```

**Cause:** Access token expired (15 min lifetime).

**Fix:**
```bash
# Use refresh token
curl -X POST http://localhost:8080/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<your-refresh-token>"}'
```

---

## MinIO Errors

### Connection Refused to MinIO

```
io.minio.errors.InvalidResponseException:
Connection refused to localhost:9005
```

**Cause:** MinIO container not running.

**Fix:**
```bash
docker-compose up -d
docker ps | grep minio
```

---

### Bucket Does Not Exist

```
io.minio.errors.ErrorResponseException:
The specified bucket does not exist
```

**Cause:** Bucket not created.

**Fix:** Access MinIO Console at http://localhost:9006 and create bucket `staymate-uploads`.

---

## Port Conflicts

### Port 8080 Already in Use

```
Embedded servlet container failed to start. Port 8080 was already in use.
```

**Fix:**
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use different port
./mvnw spring-boot:run -Dserver.port=8081
```

---

## Maven Errors

### Dependency Resolution Failed

```
Could not resolve dependencies for project
```

**Fix:**
```bash
# Clear local cache
rm -rf ~/.m2/repository

# Retry
./mvnw clean install -U
```

---

## Getting Help

If your error isn't listed:

1. **Check logs** for full stack trace
2. **Search** existing GitHub issues
3. **Open** new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
