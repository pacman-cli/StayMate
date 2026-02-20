# 🚀 StayMate Backend — Deploy to Render

> Step-by-step guide to deploy the StayMate Spring Boot backend on [Render](https://render.com) with a Supabase PostgreSQL database.

---

## Prerequisites

- [x] Frontend already deployed on Vercel
- [x] Supabase project created (see [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md))
- [x] Google OAuth credentials ready (Google Cloud Console)
- [x] GitHub repository with the StayMate code pushed

---

## Step 1: Push Code to GitHub

Ensure all the latest changes (PostgreSQL support, `application-render.properties`) are committed:

```bash
git add -A
git commit -m "feat: add Render + Supabase deployment support"
git push origin main
```

---

## Step 2: Create a Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your **GitHub repository** (StayMate)
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `staymate-backend` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Docker` |
| **Instance Type** | Free (or Starter for better performance) |

5. Click **"Create Web Service"**

---

## Step 3: Set Environment Variables

In Render Dashboard → Your Service → **Environment** tab, add these variables:

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `SPRING_PROFILES_ACTIVE` | `render` | Activates the Render profile |
| `DATABASE_URL` | `jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` | Supabase JDBC URL (see Supabase guide) |
| `DATABASE_USERNAME` | `postgres.xxxxxxxx` | Supabase DB username |
| `DATABASE_PASSWORD` | `your-supabase-db-password` | Supabase DB password |
| `JWT_SECRET` | *(generate with `openssl rand -base64 64`)* | JWT signing key |
| `ADMIN_EMAIL` | `admin@gmail.com` | Admin account email |
| `ADMIN_PASSWORD` | *(strong password)* | Admin account password |
| `ADMIN_SECRET_KEY` | *(generate a random key)* | Admin API secret |

### Google OAuth2 Variables

| Variable | Value |
|----------|-------|
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |
| `OAUTH2_REDIRECT_URI` | `https://your-vercel-app.vercel.app/oauth2/redirect` |

### CORS Configuration

| Variable | Value |
|----------|-------|
| `CORS_ALLOWED_ORIGINS` | `https://your-vercel-app.vercel.app` |

> **⚠️ Important**: Replace `your-vercel-app.vercel.app` with your actual Vercel frontend URL.

---

## Step 4: Get Your Supabase Database Connection String

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Under **Connection string**, select **JDBC**
5. Copy the connection string. It will look like:
   ```
   jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?user=postgres.xxxxxxxx&password=YOUR_PASSWORD
   ```
6. Split this into the three environment variables:
   - `DATABASE_URL` = `jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
   - `DATABASE_USERNAME` = `postgres.xxxxxxxx`
   - `DATABASE_PASSWORD` = Your password

> **💡 Tip**: Use the **Transaction mode** connection (port `6543`) for better connection pooling with Supabase's pgBouncer.

---

## Step 5: Update Google OAuth2 Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://staymate-backend.onrender.com/login/oauth2/code/google
   ```
5. Add to **Authorized JavaScript origins**:
   ```
   https://staymate-backend.onrender.com
   https://your-vercel-app.vercel.app
   ```
6. Click **Save**

> Replace `staymate-backend.onrender.com` with your actual Render URL.

---

## Step 6: Update Vercel Frontend

In your Vercel project settings, update the environment variable:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://staymate-backend.onrender.com` |
| `BACKEND_URL` | `https://staymate-backend.onrender.com` |

Then **redeploy** the frontend on Vercel for the changes to take effect.

---

## Step 7: Configure Health Check on Render

In Render Dashboard → Your Service → **Settings**:

| Setting | Value |
|---------|-------|
| **Health Check Path** | `/actuator/health` |
| **Health Check Period** | 30 seconds |

---

## Step 8: Verify Deployment

1. **Check Render logs**: Go to your service → **Logs** tab
2. **Test health endpoint**:
   ```bash
   curl https://staymate-backend.onrender.com/actuator/health
   ```
   Expected response: `{"status":"UP"}`

3. **Test API**:
   ```bash
   curl https://staymate-backend.onrender.com/api/properties/search
   ```

4. **Test frontend connectivity**: Visit your Vercel app and check if login/registration works

---

## Troubleshooting

### 🔴 "Application failed to start"
- Check Render logs for the specific error
- Verify all environment variables are set correctly
- Ensure `DATABASE_URL` starts with `jdbc:postgresql://`

### 🔴 "Connection refused to database"
- Verify Supabase project is active (not paused)
- Check if you're using the correct port (`6543` for transaction mode)
- Ensure the database password has no special characters that need URL encoding

### 🔴 "CORS errors in browser"
- Ensure `CORS_ALLOWED_ORIGINS` matches your exact Vercel URL (including `https://`)
- No trailing slash in the URL

### 🔴 "OAuth login fails"
- Verify Google OAuth redirect URIs include your Render URL
- Check that `OAUTH2_REDIRECT_URI` points to your Vercel frontend

### 🟡 "Free tier cold starts"
- Render free tier instances spin down after 15 minutes of inactivity
- First request after cold start takes ~30-60 seconds
- Consider upgrading to **Starter** ($7/month) for always-on service

---

## Architecture Overview

```
┌──────────────┐     API Calls      ┌──────────────────┐     JDBC      ┌──────────────┐
│   Frontend   │ ──────────────────→ │    Backend       │ ────────────→ │   Database   │
│   (Vercel)   │                     │   (Render)       │               │  (Supabase)  │
│   Next.js    │ ←────────────────── │  Spring Boot     │ ←──────────── │  PostgreSQL  │
└──────────────┘     JSON/JWT        └──────────────────┘    Results    └──────────────┘
                                            │
                                     OAuth2 │
                                            ↓
                                     ┌──────────────┐
                                     │   Google      │
                                     │   OAuth2      │
                                     └──────────────┘
```

---

## File Storage Note

> **⚠️ Current Limitation**: The Render deployment uses **local file storage**. Files uploaded will be lost when the service restarts or redeploys. For production use, consider:
> - **Supabase Storage** (free tier available)
> - **Cloudinary** (free tier: 25GB storage)
> - **AWS S3** (pay-as-you-go)
