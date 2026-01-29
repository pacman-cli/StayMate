# StayMate Load Testing Suite

This directory contains the [Locust](https://locust.io/) load testing scripts for the StayMate application. It simulates real-world usage patterns for Tenants, Landlords, and Anonymous users.

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.8+
- Pip (Python Package Manager)

### 2. Installation
Install the required dependencies:
```bash
pip install -r requirements.txt
```

### 3. Running the Test
Start the Locust server:
```bash
locust -f locustfile.py
```

### 4. Start Swarming
1. Open your browser to **[http://localhost:8089](http://localhost:8089)**.
2. Enter the **Token** count (e.g., 50 users).
3. Enter the **Spawn Rate** (e.g., 5 users/sec).
4. Enter the **Host** URL (default: `http://localhost:8080`).
5. Click **Start Swarming**.

## 👥 Simulated Users

The test simulates three distinct user profiles with weighted behaviors:

### 🏠 Tenant User (High Traffic)
- **Log in & Auth**: Registers/Logins and selects `ROLE_TENANT`.
- **Browsing**: Heavily searches for properties and roommates.
- **Interactions**: Views property details, checks reviews, and toggles "Saved" status.
- **Messaging**: Reads conversations and occasionally replies.

### 🔑 Landlord User (Moderate Traffic)
- **Log in & Auth**: Registers/Logins and selects `ROLE_HOUSE_OWNER`.
- **Dashboarding**: Frequently checks "My Properties" and "Booking Requests".
- **Management**: Reads and clears notifications.

### 🌎 Anonymous User (Background Traffic)
- **Passive Browsing**: Views public pages like "Recommended Properties" and "Roommate Matches".
- **No Auth**: Does not attempt to log in or modify data.

## 📊 Key Metrics to Watch
- **RPS (Requests Per Second)**: Your throughput capacity.
- **Failures**: Any non-200 responses (e.g., 500 errors).
- **p95 Response Time**: The latency for the slowest 5% of users.
