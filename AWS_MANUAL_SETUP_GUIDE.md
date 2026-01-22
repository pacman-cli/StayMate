# AWS Manual Setup Guide (Fail-Safe Edition)

> **Goal:** Deploy StayMate to `staymate.puspo.online`
> **Environment:** MacOS Terminal
> **Approach:** Fail-Safe Manual Setup (No CLI tools required)

---

## 🛑 Critical Rules for Success

1. **Use "Default VPC"** (Prevents "Operation timed out" errors).
2. **Use `t3.small` Instance** (Prevents "System frozen" errors).
3. **Use Ubuntu 22.04 LTS** (Most stable for Docker).
4. **Follow Steps Exactly** (Do not skip verification steps).

---

## 1. Prerequisites (Check First)

- [ ] **AWS Account** with billing enabled (t3.small costs ~$0.02/hr).
- [ ] **Domain** (`puspo.online`) added to Cloudflare.
- [ ] **SSH Client:** Your MacOS Terminal.
- [ ] **Key Pair:** Delete any old `staymate-key.pem` files to start fresh.

---

## 2. Launch EC2 Instance (Network Safe Mode)

We will use the **Default VPC** to guarantee internet connectivity.

1.  Go to **EC2 Console** → **Launch Instance**.
2.  **Name:** `staymate-prod`
3.  **OS Images (AMI):** Select **Ubuntu** → **Ubuntu Server 22.04 LTS (HVM)**.
4.  **Instance Type:** Select **`t3.small`** (2 vCPU, 2 GB RAM).
    > *Warning: `t2.micro` (free tier) WILL freeze during build. Spend the $0.50 for setup.*

5.  **Key Pair:**
    *   Click **Create new key pair**.
    *   Name: `staymate-key-final`
    *   Type: **RSA**
    *   Format: **.pem**
    *   Click **Create** → It will download to `~/Downloads/`.

6.  **Network Settings (Edit):**
    *   **VPC:** Select **(default)**. *Do NOT select a custom VPC.*
    *   **Subnet:** **No preference** (Default subnets are always Public).
    *   **Auto-assign Public IP:** **Enable**.
    *   **Security Group:** Create security group.
        *   Name: `staymate-sg-final`
        *   **Rule 1:** SSH | TCP | 22 | **My IP**
        *   **Rule 2:** HTTP | TCP | 80 | 0.0.0.0/0 (Anywhere)
        *   **Rule 3:** HTTPS | TCP | 443 | 0.0.0.0/0 (Anywhere)
        *   **Rule 4:** Custom TCP | 8080 | 0.0.0.0/0 (Anywhere - for testing)

7.  **Storage:** 30 GB (gp3).

8.  **Launch Instance.**

---

## 3. Verify Connection (Immediate Check)

Do this BEFORE installing anything.

1.  Open MacOS Terminal.
2.  Set key permissions:
    ```bash
    chmod 400 ~/Downloads/staymate-key-final.pem
    ```
3.  Get your **Public IPv4 address** from AWS Console.
4.  Connect:
    ```bash
    ssh -i ~/Downloads/staymate-key-final.pem ubuntu@YOUR_PUBLIC_IP
    ```

> **If this connects:** Proceed to Step 4.
> **If this fails:** STOP. Check Security Group "My IP" rule again. Your IP might have changed.

---

## 4. Install Software (The Safe Way)

Paste these commands **block by block**. Do not paste all at once.

### Block A: System Updates & Docker
```bash
# Update Ubuntu
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose git

# Enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to Docker group (Vital)
sudo usermod -aG docker ubuntu
```

### Block B: Logout & Login
**You MUST do this for permissions to work.**
1.  Type `exit` to disconnect.
2.  Press `Up Arrow` → `Enter` to SSH back in.
3.  Type `docker ps` → If you see column headers, you are good.

---

## 5. Deploy Application

### Step 5.1: Clone & Configure
```bash
# Setup directory
sudo mkdir -p /opt/staymate
sudo chown ubuntu:ubuntu /opt/staymate
cd /opt/staymate

# Clone your code
git clone https://github.com/YOUR_GITHUB_USERNAME/StayMate.git .
```

### Step 5.2: Create Environment File
```bash
nano .env
```
Paste your **Production .env content** here.
*Tip: Use `Ctrl+O`, `Enter`, `Ctrl+X` to save and exit.*

### Step 5.3: Build & Launch
```bash
docker-compose -f docker-compose.aws.yml up -d --build
```

> **Wait Time:** This will take 5-10 minutes.
> Because we are using `t3.small`, it will NOT freeze.

### Step 5.4: Verify Containers
```bash
docker ps
```
You should see `staymate-nginx`, `staymate-backend-prod`, `staymate-frontend-prod`, `staymate-db-prod`.

---

## 6. Cloudflare Setup (DNS)

1.  Go to **Cloudflare Dashboard**.
2.  Select `staymate.puspo.online`.
3.  **DNS** → **Add Record**:
    *   **Type:** `A`
    *   **Name:** `staymate` (makes staymate.puspo.online)
    *   **Content:** `YOUR_EC2_PUBLIC_IP`
    *   **Proxy status:** **Proxied (Orange Cloud)**
    *   **Save**.

4.  **SSL/TLS** → **Edge Certificates**:
    *   Always Use HTTPS: **On**

---

## 7. Troubleshooting Guide (MacOS Specific)

### 🔴 "Operation timed out"
*   **Cause:** Firewall blocking Port 22.
*   **Fix:** AWS Console → Security Groups → `staymate-sg-final` → Edit inbound rules → Delete SSH rule → Add new SSH rule → Select **My IP**.

### 🔴 "Permission denied (publickey)"
*   **Cause:** Wrong key file or wrong user.
*   **Fix:**
    *   Use `ubuntu@...` (NOT `ec2-user@` or `root@`).
    *   Ensure command points to `~/Downloads/staymate-key-final.pem`.

### 🔴 "System is booting" / unresponsive
*   **Cause:** Instance ran out of RAM.
*   **Fix:** Use `t3.small` as recommended. `t2.micro` cannot handle the build process.

### 🔴 Site gives "502 Bad Gateway"
*   **Cause:** Backend container crashed or isn't ready.
*   **Fix:**
    ```bash
    docker logs staymate-backend-prod
    ```
    *Look for "Started StayMateApplication in X seconds"*.

---

## 8. Final Success Check

Open **https://staymate.puspo.online** in your browser.
You should see your landing page secured with SSL.

