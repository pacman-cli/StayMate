# 🗄️ StayMate Database — Deploy to Supabase

> Step-by-step guide to set up the StayMate PostgreSQL database on [Supabase](https://supabase.com).

---

## Prerequisites

- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- The StayMate backend ready to deploy on Render (see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md))

---

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the details:

| Setting | Value |
|---------|-------|
| **Organization** | Select or create one |
| **Project Name** | `staymate` |
| **Database Password** | *(Choose a strong password — save this!)* |
| **Region** | Choose closest to your Render deployment region |
| **Pricing Plan** | Free (500MB database, 2 projects) |

4. Click **"Create new project"**
5. Wait for the project to be provisioned (~2 minutes)

> **🔑 IMPORTANT**: Save your database password securely! You'll need it for the Render environment variables. You cannot retrieve it later.

---

## Step 2: Get Database Connection Details

1. In your Supabase project, go to **Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **JDBC** tab
4. You'll see a connection string like:
   ```
   jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?user=postgres.abcdefgh&password=[YOUR-PASSWORD]
   ```

5. Extract the following values for Render:

| Environment Variable | Value | Where to Find |
|---------------------|-------|---------------|
| `DATABASE_URL` | `jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` | Connection string (before `?`) |
| `DATABASE_USERNAME` | `postgres.abcdefgh` | The `user=` parameter |
| `DATABASE_PASSWORD` | Your project password | Set during project creation |

> **💡 Use Transaction Mode (Port 6543)**: This uses Supabase's pgBouncer connection pooler, which is better for serverless/container deployments. Don't use port `5432` (direct connection) as it has a limited connection count.

---

## Step 3: Understand Schema Auto-Creation

The StayMate backend uses **Hibernate `ddl-auto=update`** in the Render profile. This means:

- ✅ **All tables are automatically created** from JPA entity definitions on first startup
- ✅ **New columns** are automatically added when entities change
- ⚠️ **No seed data** — You start with empty tables
- ⚠️ **Columns are never dropped** — Old columns remain even if removed from entities

### Tables Created Automatically

The following tables will be created by Hibernate on first run:

| Table | Description |
|-------|-------------|
| `users` | User accounts (tenants, landlords, admins) |
| `user_roles` | User role assignments |
| `properties` | Property listings |
| `property_availability` | Availability schedule |
| `amenities` | Property amenities |
| `seats` | Room/seat allocations |
| `bookings` | Booking records |
| `applications` | Rental applications |
| `conversations` | Chat conversations |
| `messages` | Chat messages |
| `notifications` | User notifications |
| `reviews` | Property reviews |
| `reports` | User/property reports |
| `matches` | Roommate matches |
| `roommate_posts` | Roommate finder posts |
| `roommate_requests` | Roommate connection requests |
| `maintenance_requests` | Maintenance tickets |
| `saved_properties` | Saved/bookmarked properties |
| `saved_roommates` | Saved roommate posts |
| `verification_requests` | ID verification requests |
| `earnings` | Landlord earnings |
| `payments` | Payment records |
| `payout_methods` | Payout method configurations |
| `payout_requests` | Payout requests |
| `audit_logs` | Audit trail |
| `support_tickets` | Support tickets |
| `support_messages` | Support ticket messages |
| `expenses` | Dashboard expenses |
| `complaints` | Admin complaints |
| `fraud_events` | Fraud detection events |
| `cms_contents` | CMS content blocks |
| `inquiries` | Property inquiries |

---

## Step 4: Create Admin User

After the backend starts on Render, the **DataSeeder** automatically creates an admin user. The credentials are set via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_EMAIL` | `admin@gmail.com` | Admin login email |
| `ADMIN_PASSWORD` | `admin123` | Admin login password |

> **🔒 Security**: Change the default admin password for production!

---

## Step 5: Verify Database Connection

### From Supabase Dashboard

1. Go to **Table Editor** in the left sidebar
2. After the backend first connects, you should see all the tables listed
3. Click on `users` to verify the admin user was created

### From the Backend

Check the Render logs for:
```
Hibernate: create table users (...)
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
```

If you see these lines, the database connection is working correctly.

---

## Step 6: Supabase Dashboard Features (Optional)

Supabase provides several useful tools:

### SQL Editor
- Run custom queries directly
- Useful for data inspection and debugging
- Path: **SQL Editor** in the sidebar

### Table Editor
- Visual table browser
- Edit rows directly
- Path: **Table Editor** in the sidebar

### Database Backups
- **Free tier**: Weekly automatic backups
- **Pro tier**: Daily backups with point-in-time recovery
- Path: **Settings** → **Database** → **Backups**

### Monitoring
- Connection count monitoring
- Query performance insights
- Path: **Reports** in the sidebar

---

## Step 7: Database Maintenance

### Connection Pooling
Supabase uses **pgBouncer** for connection pooling. The `application-render.properties` is configured with:
- `maximum-pool-size=5` (suitable for free tier's 60 connection limit)
- `minimum-idle=2`

### Pausing Prevention
⚠️ **Free tier projects pause after 7 days of inactivity**. To prevent this:
- Set up a health check ping from an external monitoring service
- Or upgrade to the Pro plan ($25/month)

### Database Size
- **Free tier limit**: 500MB
- Monitor usage in **Settings** → **Database** → **Database size**

---

## Troubleshooting

### 🔴 "Connection refused"
- Ensure you're using port `6543` (transaction mode), not `5432`
- Check if the Supabase project is paused (free tier pauses after inactivity)
- Go to Supabase Dashboard and click "Restore" if paused

### 🔴 "Password authentication failed"
- Double-check the database password (case-sensitive)
- Ensure no special characters are breaking the JDBC URL
- Try resetting the password: **Settings** → **Database** → **Reset database password**

### 🔴 "Too many connections"
- Free tier allows 60 connections max
- Ensure `maximum-pool-size` in the render profile is ≤ 5
- Check if other services are also connecting to the same database

### 🔴 "Permission denied for schema public"
- This can happen with newer Supabase projects
- Fix by running in the SQL Editor:
  ```sql
  GRANT ALL ON SCHEMA public TO postgres;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
  ```

---

## Quick Reference

```
Supabase Dashboard:   https://supabase.com/dashboard
Connection Mode:      Transaction (port 6543)
Max Connections:      5 (HikariCP) / 60 (Supabase limit)
Schema Management:    Hibernate ddl-auto=update
Free Tier Storage:    500MB
Backup Frequency:     Weekly (free) / Daily (pro)
Pause Policy:         7 days inactivity (free tier)
```
