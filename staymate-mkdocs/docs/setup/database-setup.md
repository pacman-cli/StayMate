# Database Setup

Configure MySQL for StayMate development.

---

## Overview

| Property | Value |
|----------|-------|
| **Database** | MySQL 8.0+ |
| **Default Name** | `authdb` |
| **Default User** | `root` |
| **Port** | `3306` |
| **Migrations** | Flyway (automatic) |

---

## Step 1: Start MySQL

=== "macOS (Homebrew)"

    ```bash
    brew services start mysql
    ```

=== "Linux (systemd)"

    ```bash
    sudo systemctl start mysql
    sudo systemctl enable mysql  # Start on boot
    ```

=== "Docker (Alternative)"

    ```bash
    docker run -d \
      --name staymate-mysql \
      -e MYSQL_ROOT_PASSWORD=your_password \
      -e MYSQL_DATABASE=authdb \
      -p 3306:3306 \
      mysql:8.0
    ```

---

## Step 2: Create Database

```bash
# Connect to MySQL
mysql -u root -p

# In MySQL shell:
CREATE DATABASE authdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Verify
SHOW DATABASES;
```

Expected output:
```
+--------------------+
| Database           |
+--------------------+
| authdb             |
| information_schema |
| mysql              |
+--------------------+
```

---

## Step 3: Configure Connection

The application uses environment variables with fallback defaults.

### Option A: Use Defaults (Development)

No configuration needed. Defaults are:

```properties
DB_HOST=localhost
DB_PORT=3306
DB_NAME=authdb
DB_USERNAME=root
DB_PASSWORD=MdAshikur123+  # Change this!
```

### Option B: Environment Variables (Recommended)

```bash
# Add to ~/.zshrc or ~/.bashrc
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=authdb
export DB_USERNAME=root
export DB_PASSWORD=your_secure_password
```

### Option C: .env File

Create `server/.env`:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=authdb
DB_USERNAME=root
DB_PASSWORD=your_secure_password
```

---

## Step 4: Verify Connection

```bash
mysql -u root -p -e "SELECT 1 AS connected;"
```

Expected:
```
+-----------+
| connected |
+-----------+
|         1 |
+-----------+
```

---

## Flyway Migrations

!!! info "Automatic Migrations"
    When you start the application, Flyway automatically:

    1. Connects to MySQL
    2. Creates `flyway_schema_history` table
    3. Runs all `V*__*.sql` migrations in order
    4. Records applied migrations

    **You don't need to run migrations manually.**

Migrations location:
```
server/src/main/resources/db/migration/
├── V1__init_schema.sql
├── V2__create_property_table.sql
├── ...
└── V120__alter_verification_requests_status.sql
```

---

## Troubleshooting

### Access Denied

```
Access denied for user 'root'@'localhost'
```

**Fix:**
```bash
# Reset MySQL root password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
EXIT;
```

### Database Not Found

```
Unknown database 'authdb'
```

**Fix:**
```bash
mysql -u root -p -e "CREATE DATABASE authdb;"
```

---

## Next Step

→ [Local Setup](local-setup.md)
