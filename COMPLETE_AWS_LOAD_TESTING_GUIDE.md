# A–Z Guide to Hosting and Load Testing StayMate

> **Assumptions Made:**
> - You have zero AWS knowledge
> - You have never used load testing tools
> - You're deploying the existing StayMate codebase
> - You want a production-ready, scalable deployment
> - You want to test performance before going live

---

## PART 1: AWS HOSTING GUIDE

---

## A - AWS Account Setup

### Step 1: Create Your AWS Account
1. Go to [https://aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Choose "Personal" or "Professional" (choose Professional for business)
4. Fill in your email, password, and account name
5. Enter credit card information (required for identity verification)
6. Verify your phone number
7. Choose a support plan (Basic is free)

### Step 2: Sign In to Console
- URL: `https://console.aws.amazon.com`
- Your default region will be selected (we'll change this next)

**Why you need this:** AWS account is your gateway to all cloud services. Think of it as your cloud landlord.

---

## B - Billing and Cost Management

### Step 1: Set Up Billing Alerts
1. Go to AWS Console → Billing → Billing Preferences
2. Enable "Receive Billing Alerts"
3. Go to CloudWatch → Alarms → Create alarm
4. Select metric: "Billing > EstimatedCharges"
5. Set threshold (e.g., $50/month)
6. Add your email for notifications

### Step 2: Understand Free Tier Limits
- **EC2**: 750 hours/month (t2.micro only)
- **RDS**: 750 hours/month (db.t2.micro only)
- **S3**: 5GB storage
- **Data Transfer**: 100GB/month out to internet

**Cost-saving tip:** Always use Free Tier eligible services for development.

---

## C - Choose Your Region

### Step 1: Select the Right Region
**Recommended regions for beginners:**
- `us-east-1` (N. Virginia) - Most services, lowest latency for US users
- `us-west-2` (Oregon) - Good for West Coast users
- `eu-west-1` (Ireland) - Best for European users

### Step 2: Set Default Region
1. In AWS Console, click your name → "My Security Credentials"
2. Look for "Default region" setting
3. Select your chosen region

**Why this matters:** Region affects latency, pricing, and service availability.

---

## D - IAM Users and Security

### Step 1: Create Admin IAM User
1. Go to IAM → Users → Create user
2. Username: `staymate-admin`
3. Select "AWS Management Console access"
4. Set custom password
5. Click "Next: Permissions"
6. Choose "Attach existing policies directly"
7. Select `AdministratorAccess`
8. Create user

### Step 2: Create Deployment IAM User
1. IAM → Users → Create user
2. Username: `staymate-deploy`
3. Select "Programmatic access"
4. Permissions: Create inline policy with:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:*",
                "rds:*",
                "s3:*",
                "elasticloadbalancing:*",
                "route53:*",
                "cloudformation:*",
                "iam:PassRole"
            ],
            "Resource": "*"
        }
    ]
}
```

### Step 3: Save Credentials Securely
- Download CSV with access keys
- Store in password manager
- Never share or commit to git

**Security principle:** Never use root account for daily operations.

---

## E - EC2 Instance Setup

### Step 1: Launch EC2 Instance
1. EC2 → Instances → Launch instances
2. Name: `staymate-server`
3. AMI: `Ubuntu Server 22.04 LTS` (Free Tier eligible)
4. Instance type: `t3.medium` (2 vCPU, 4GB RAM) - $30/month
5. Key pair: Create new key pair, name `staymate-key`, download .pem file

### Step 2: Configure Security Group
1. Create security group: `staymate-sg`
2. Inbound rules:
   - SSH (22): Your IP only
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0
   - Custom (3000): 0.0.0.0/0 (for frontend)
   - Custom (8080): 0.0.0.0/0 (for backend)

### Step 3: Storage Configuration
- Root volume: 30GB GP3 (Free Tier: 8GB)
- Add volume: 50GB GP3 for application data

**Why t3.medium:** StayMate needs more than t2.micro's 1GB RAM for Java + MySQL + Docker.

---

## F - Configure EC2 Server

### Step 1: Connect to EC2
```bash
chmod 400 staymate-key.pem
ssh -i staymate-key.pem ubuntu@your-ec2-public-ip
```

### Step 2: Install Docker and Docker Compose
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reboot to apply group changes
sudo reboot
```

### Step 3: Install Additional Tools
```bash
# Install Git
sudo apt install git -y

# Install Node.js (for frontend builds)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install AWS CLI
sudo apt install awscli -y
```

**Why Docker:** StayMate uses Docker Compose for multi-service deployment.

---

## G - Git Repository Setup

### Step 1: Clone StayMate Repository
```bash
# Connect to EC2 again
ssh -i staymate-key.pem ubuntu@your-ec2-public-ip

# Create application directory
sudo mkdir -p /opt/staymate
sudo chown ubuntu:ubuntu /opt/staymate
cd /opt/staymate

# Clone your repository (replace with your repo URL)
git clone https://github.com/your-username/StayMate.git .
```

### Step 2: Configure Git Credentials
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Why this:** You need the source code on the server to build and deploy.

---

## H - RDS Database Setup

### Step 1: Create RDS Instance
1. RDS → Create database
2. Choose "Standard Create"
3. Engine: MySQL
4. Version: MySQL 8.0.35
5. Templates: "Free tier"
6. DB instance identifier: `staymate-db`
7. Master username: `admin`
8. Master password: Generate strong password
9. Instance class: `db.t3.micro` (Free Tier)
10. Storage: 20GB General Purpose SSD
11. VPC: Default VPC
12. Public access: Yes (for EC2 access)
13. VPC security group: Create new `staymate-db-sg`

### Step 2: Configure Database Security
1. Edit `staymate-db-sg` security group
2. Add inbound rule:
   - Type: MySQL/Aurora (3306)
   - Source: `staymate-sg` (allow EC2 instance)

### Step 3: Get Connection Details
- Endpoint: `staymate-db.xxxxxxxxxx.us-east-1.rds.amazonaws.com`
- Port: 3306
- Database: `staymate_prod`

**Why RDS instead of MySQL in Docker:** Managed backups, automatic updates, better security.

---

## I - S3 Bucket for File Storage

### Step 1: Create S3 Bucket
1. S3 → Create bucket
2. Bucket name: `staymate-uploads-unique-name` (must be globally unique)
3. Region: Same as your EC2
4. Block all public access: Keep checked
5. Create bucket

### Step 2: Configure Bucket Policy
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::staymate-uploads-unique-name/*"
        }
    ]
}
```

### Step 3: Enable CORS
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
</CORSConfiguration>
```

**Why S3:** StayMate stores user uploads (profile pictures, property images).

---

## J - Environment Variables Configuration

### Step 1: Create Production .env File
```bash
cd /opt/staymate
cp .env.prod.example .env
nano .env
```

### Step 2: Configure Database Variables
```env
# Database Configuration
DB_HOST=staymate-db.xxxxxxxxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=staymate_prod
DB_USERNAME=admin
DB_PASSWORD=your-rds-password-here
```

### Step 3: Configure Security Variables
```env
# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=strong-admin-password
ADMIN_SECRET_KEY=unique-admin-secret-key
```

### Step 4: Configure OAuth2
```env
# Get these from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH2_REDIRECT_URI=https://yourdomain.com/oauth2/redirect
```

### Step 5: Configure Application
```env
# CORS and Server
CORS_ALLOWED_ORIGINS=https://yourdomain.com
SERVER_PORT=8080
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60

# Frontend
NEXT_PUBLIC_API_URL=https://yourdomain.com
BACKEND_URL=http://server:8080
```

**Why .env file:** Keeps secrets out of code and allows easy configuration changes.

---

## K - Deploy Application with Docker

### Step 1: Build and Start Services
```bash
cd /opt/staymate
chmod +x deploy-aws.sh

# Build Docker images
./deploy-aws.sh build

# Deploy all services
./deploy-aws.sh deploy
```

### Step 2: Verify Deployment
```bash
# Check service status
./deploy-aws.sh status

# View logs if needed
./deploy-aws.sh logs server
```

### Step 3: Test Application
```bash
# Test backend health
curl http://localhost:8080/actuator/health

# Test frontend
curl http://localhost:3000
```

**Why Docker Compose:** Manages all services (database, backend, frontend, nginx) together.

---

## L - Load Balancer Setup

### Step 1: Create Application Load Balancer
1. EC2 → Load Balancers → Create Load Balancer
2. Choose "Application Load Balancer"
3. Name: `staymate-alb`
4. Scheme: Internet-facing
5. VPC: Default VPC
6. Mappings: Select all availability zones
7. Security group: `staymate-alb-sg` (allow HTTP/HTTPS)

### Step 2: Configure Target Group
1. Create target group: `staymate-targets`
2. Target type: Instance
3. Protocol: HTTP, Port: 80
4. Health check: Path `/health`, Protocol HTTP
5. Register EC2 instance

### Step 3: Configure Listener
1. Default action: Forward to `staymate-targets`
2. Add HTTPS listener (will configure SSL next)

**Why Load Balancer:** Distributes traffic, provides SSL termination, high availability.

---

## M - SSL Certificate with ACM

### Step 1: Request SSL Certificate
1. ACM → Request certificate
2. Request public certificate
3. Domain names: `yourdomain.com`, `www.yourdomain.com`
4. Validation method: DNS validation
5. Request certificate

### Step 2: Validate Domain
1. Click certificate → "Create record in Route 53"
2. Route 53 will create CNAME records automatically
3. Wait for validation (usually 5-30 minutes)

### Step 3: Update Load Balancer
1. Go to Load Balancer → Listeners
2. Add HTTPS listener
3. Select your ACM certificate
4. Default action: Forward to target group
5. Set HTTP listener to redirect to HTTPS

**Why ACM:** Free SSL certificates, automatic renewal.

---

## N - Route 53 Domain Setup

### Step 1: Register or Transfer Domain
**Option A: Register new domain**
1. Route 53 → Registered domains → Register domain
2. Search for available domain
3. Complete purchase (~$12/year)

**Option B: Transfer existing domain**
1. Get authorization code from current registrar
2. Route 53 → Transfer domain
3. Follow transfer process

### Step 2: Create Hosted Zone
1. Route 53 → Hosted zones → Create hosted zone
2. Domain name: `yourdomain.com`
3. Type: Public hosted zone

### Step 3: Update DNS Records
1. Delete default A records
2. Create A record:
   - Name: `yourdomain.com`
   - Type: A
   - Alias: Yes
   - Route traffic to: `staymate-alb`
3. Create A record for `www` pointing to same ALB

### Step 4: Update Nameservers
1. Copy Route 53 nameservers
2. Update at domain registrar
3. Wait for propagation (1-48 hours)

**Why Route 53:** Integrated with AWS, automatic DNS updates for ALB.

---

## O - OAuth2 Configuration

### Step 1: Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: `staymate-production`
3. Enable APIs:
   - Google+ API
   - Google OAuth2 API

### Step 2: Create OAuth2 Credentials
1. APIs & Services → Credentials → Create Credentials
2. OAuth client ID → Web application
3. Name: `StayMate Production`
4. Authorized JavaScript origins:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`
5. Authorized redirect URIs:
   - `https://yourdomain.com/login/oauth2/code/google`
   - `https://yourdomain.com/oauth2/redirect`

### Step 3: Update Environment Variables
```bash
# Update .env file with Google credentials
nano .env

# Add these lines:
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 4: Restart Backend
```bash
cd /opt/staymate
./deploy-aws.sh restart
```

**Why OAuth2:** Allows users to login with Google account.

---

## PART 2: Beginner Guide to Load Testing StayMate with Apache JMeter

---

## What is Load Testing?

Load testing is like testing how many people can use your application at the same time before it slows down or breaks. Think of it like testing a bridge - you want to know how many cars can drive on it safely before it starts to shake.

### Why StayMate Needs Load Testing

StayMate is a roommate and property matching platform that will have:
- Multiple users browsing properties simultaneously
- People logging in and signing up
- Booking requests being created
- Messages being sent between users
- Dashboard analytics being calculated

If 100 users try to browse properties at the same time, will your server handle it? Load testing answers this question **before** real users experience problems.

---

## Understanding StayMate's Architecture for Testing

Based on the codebase analysis, StayMate has these main API endpoints:

### Authentication APIs
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/me` - Get current user info

### Property APIs
- `GET /api/properties` - Browse/search properties
- `GET /api/properties/{id}` - Get property details
- `POST /api/properties` - Create property (landlords)
- `GET /api/properties/my-properties` - Get my properties

### Booking APIs
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get my bookings
- `GET /api/bookings/requests` - Get booking requests (landlords)

### Messaging APIs
- `GET /api/messages/conversations` - Get conversations
- `POST /api/messages/send` - Send message
- `GET /api/messages/unread-count` - Get unread count

### Roommate APIs
- `GET /api/roommates` - Search roommate posts
- `POST /api/roommates` - Create roommate post

---

## Load Testing Folder Structure

Create this folder structure in your project:

```
load-testing/
├── jmeter/
│   ├── test-plans/
│   │   ├── staymate-basic-test.jmx
│   │   ├── staymate-load-test.jmx
│   │   └── staymate-stress-test.jmx
│   ├── csv-data/
│   │   ├── test-users.csv
│   │   ├── property-data.csv
│   │   └── booking-data.csv
│   ├── results/
│   │   ├── basic-test-results.jtl
│   │   ├── load-test-results.jtl
│   │   └── stress-test-results.jtl
│   └── reports/
│       ├── basic-test-report.html
│       ├── load-test-report.html
│       └── stress-test-report.html
├── README.md
└── setup-instructions.md
```

### What Each Folder Contains

**test-plans/**: JMX files are your test recipes. Each file contains instructions for what to test, how many users, and what to measure.

**csv-data/**: CSV files contain test data like usernames, passwords, property IDs. This makes your tests realistic.

**results/**: JTL files store raw test results in a format that's easy to analyze and import into spreadsheets.

**reports/**: HTML reports are beautiful, interactive reports that make it easy to understand your test results.

---

## What is Apache JMeter?

Apache JMeter is a free, open-source tool for testing performance. Think of it as a robot army that can simulate hundreds or thousands of users using your application at the same time.

### Why JMeter for StayMate?

- **Free**: No cost, perfect for startups
- **GUI**: Easy to use with visual interface
- **Powerful**: Can test complex scenarios
- **Community**: Lots of tutorials and help available
- **Compatible**: Works with any web application

---

## Installing JMeter

### Windows Installation
1. Go to [https://jmeter.apache.org/download_jmeter.cgi](https://jmeter.apache.org/download_jmeter.cgi)
2. Download the ZIP file (not the installer)
3. Extract to `C:\jmeter`
4. Go to `C:\jmeter\bin`
5. Double-click `jmeter.bat`

### macOS Installation
```bash
# Using Homebrew (recommended)
brew install jmeter

# Or manual download
curl -O https://downloads.apache.org//jmeter/binaries/apache-jmeter-5.6.3.tgz
tar -xzf apache-jmeter-5.6.3.tgz
cd apache-jmeter-5.6.3/bin
./jmeter
```

### Linux Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install jmeter

# Or manual download
wget https://downloads.apache.org//jmeter/binaries/apache-jmeter-5.6.3.tgz
tar -xzf apache-jmeter-5.6.3.tgz
cd apache-jmeter-5.6.3/bin
./jmeter
```

---

## Opening JMeter for the First Time

When you start JMeter, you'll see:
1. **Test Plan**: This is your main container
2. **WorkBench**: A scratchpad for testing
3. **Menu Bar**: File, Edit, Run, etc.

**Don't be overwhelmed!** We'll build everything step by step.

---

## Creating Your First Test Plan

### Step 1: Create Basic Test Structure
1. Right-click on "Test Plan" → Add → Threads (Users) → Thread Group
2. Right-click on Thread Group → Add → Sampler → HTTP Request
3. Right-click on Thread Group → Add → Listener → View Results Tree
4. Right-click on Thread Group → Add → Listener → Summary Report

### Step 2: Configure Thread Group (Users)
```
Name: StayMate Basic Users
Number of Threads (Users): 10
Ramp-up Period (in seconds): 5
Loop Count: 1
```

**What this means:**
- 10 users will access your app
- They'll start over 5 seconds (2 users per second)
- Each user will run the test once

---

## Testing StayMate Authentication

### Step 1: Create Login Test
1. Add HTTP Request sampler
2. Configure it:
```
Name: User Login
Protocol: http
Server Name: localhost (or your domain)
Port Number: 8080
Path: /api/auth/login
Method: POST
Parameters:
  - Name: email, Value: test@example.com
  - Name: password, Value: password123
```

### Step 2: Handle JSON Response
Add a "JSON Extractor" to save the JWT token:
1. Right-click HTTP Request → Add → Post Processor → JSON Extractor
2. Configure:
```
Name: JWT Token
JSON Path: $.accessToken
Template: $1$
Default Value: NOT_FOUND
Reference Name: jwt_token
```

### Step 3: Use Token in Subsequent Requests
For authenticated requests, add HTTP Header Manager:
1. Right-click Thread Group → Add → Config Element → HTTP Header Manager
2. Add header:
```
Name: Authorization
Value: Bearer ${jwt_token}
```

---

## Using CSV Data for Realistic Testing

### Step 1: Create Test Users CSV
Create `load-testing/jmeter/csv-data/test-users.csv`:
```csv
email,password,firstName,lastName
test1@example.com,password123,John,Doe
test2@example.com,password123,Jane,Smith
test3@example.com,password123,Bob,Johnson
test4@example.com,password123,Alice,Brown
test5@example.com,password123,Charlie,Wilson
```

### Step 2: Configure CSV Data Set Config
1. Right-click Thread Group → Add → Config Element → CSV Data Set Config
2. Configure:
```
Filename: test-users.csv
Variable Names: email,password,firstName,lastName
Delimiter: ,
```

### Step 3: Use Variables in HTTP Request
Update your login request:
```
Parameters:
  - Name: email, Value: ${email}
  - Name: password, Value: ${password}
```

---

## Complete StayMate Test Scenarios

### Scenario 1: 10 Users Login and Browse Properties
```
Thread Group:
- Number of Users: 10
- Ramp-up: 5 seconds
- Loop Count: 3

Test Flow:
1. Login (POST /api/auth/login)
2. Get Properties (GET /api/properties)
3. Get Property Details (GET /api/properties/1)
4. Get My Profile (GET /api/auth/me)
```

### Scenario 2: 50 Users Browse and Search
```
Thread Group:
- Number of Users: 50
- Ramp-up: 10 seconds
- Loop Count: 5

Test Flow:
1. Login (POST /api/auth/login)
2. Search Properties (GET /api/properties?location=NewYork)
3. Browse Roommates (GET /api/roommates)
4. Get Dashboard Stats (GET /api/dashboard/stats)
```

### Scenario 3: 100 Users Create Bookings
```
Thread Group:
- Number of Users: 100
- Ramp-up: 20 seconds
- Loop Count: 2

Test Flow:
1. Login (POST /api/auth/login)
2. Get Properties (GET /api/properties)
3. Create Booking (POST /api/bookings)
4. Get My Bookings (GET /api/bookings/my-bookings)
```

---

## Command Line Testing (Non-GUI)

### Why Use Command Line?
- **Faster**: No GUI overhead
- **Servers**: Can run on headless servers
- **Automation**: Easy to integrate with CI/CD
- **Resources**: Uses less memory and CPU

### Basic Command Line Usage
```bash
# Navigate to JMeter bin directory
cd apache-jmeter-5.6.3/bin

# Run test in non-GUI mode
./jmeter -n -t ../test-plans/staymate-basic-test.jmx -l ../results/basic-test-results.jtl

# Generate HTML report
./jmeter -g ../results/basic-test-results.jtl -o ../reports/basic-test-report/
```

### Command Line Options Explained
- `-n`: Non-GUI mode
- `-t`: Test plan file (.jmx)
- `-l`: Results file (.jtl)
- `-g`: Generate report dashboard
- `-o`: Output folder for report
- `-Jproperty=value`: Set JMeter property

### Example Commands for StayMate
```bash
# Basic test with 10 users
./jmeter -n -t staymate-basic-test.jmx -l basic-results.jtl -Jusers=10 -Jrampup=5

# Load test with 50 users
./jmeter -n -t staymate-load-test.jmx -l load-results.jtl -Jusers=50 -Jrampup=10

# Stress test with 200 users
./jmeter -n -t staymate-stress-test.jmx -l stress-results.jtl -Jusers=200 -Jrampup=30
```

---

## Understanding Test Results

### Key Metrics Explained

**Response Time**: How long it takes for your server to respond
- Good: < 200ms
- OK: 200-500ms
- Slow: 500-2000ms
- Bad: > 2000ms

**Throughput**: How many requests per second your server can handle
- Higher is better
- Measure in requests/second

**Error Rate**: Percentage of failed requests
- Good: < 1%
- OK: 1-5%
- Bad: > 5%

**CPU/Memory Usage**: Server resource consumption
- Monitor during tests
- Should stay below 80%

### Reading JMeter Reports

**View Results Tree**: Shows individual requests
- Green: Success
- Red: Failed
- Click to see request/response details

**Summary Report**: Aggregated statistics
- Average response time
- Min/Max response time
- Throughput
- Error percentage

**HTML Report**: Beautiful dashboard
- Charts and graphs
- Detailed statistics
- Easy to share with team

---

## AWS + Load Testing Best Practices

### When to Test Locally vs AWS

**Local Testing:**
- Development phase
- Quick feedback
- No AWS costs
- Limited by your machine

**AWS Testing:**
- Production-like environment
- Real network conditions
- More accurate results
- Costs money

### Safe Testing Limits for Beginners

**Start Small:**
- 10 users: Basic functionality test
- 50 users: Load test
- 100 users: Stress test
- 500+ users: Advanced (be careful!)

**Cost Control:**
- Use smaller EC2 instances for testing
- Monitor your AWS billing
- Stop instances when done
- Set up billing alerts

### AWS Load Testing Setup

### Option 1: Use Your Existing EC2
```bash
# Install JMeter on your StayMate EC2
sudo apt update
sudo apt install jmeter -y

# Run tests from the same server
cd /opt/staymate/load-testing/jmeter
jmeter -n -t test-plans/staymate-load-test.jmx -l results/load-test.jtl
```

### Option 2: Separate Load Testing Instance
1. Launch `t3.micro` EC2 for testing
2. Install JMeter
3. Run tests against your main application
4. Terminate when done

### Monitoring During Tests
```bash
# Watch CPU usage
htop

# Watch memory usage
free -h

# Watch network activity
iftop

# Check application logs
tail -f /opt/staymate/logs/application.log
```

---

## Common Beginner Mistakes to Avoid

### Testing Mistakes
1. **Testing localhost instead of production URL**
2. **Not handling authentication properly**
3. **Using same user data for all threads**
4. **Ignoring think time between requests**
5. **Not monitoring server during tests**

### AWS Mistakes
1. **Forgetting to stop test instances**
2. **Running large tests on expensive instances**
3. **Not setting up billing alerts**
4. **Testing during peak hours (affects other users)**
5. **Not cleaning up test resources**

### JMeter Mistakes
1. **Using GUI mode for large tests**
2. **Not saving test results**
3. **Ignoring error messages**
4. **Not using realistic data**
5. **Running tests without understanding what they measure**

---

## Quick Start Checklist

### Before Testing
- [ ] StayMate is deployed and running
- [ ] You have test user accounts
- [ ] JMeter is installed
- [ ] Test data files are created
- [ ] AWS billing alerts are set

### During Testing
- [ ] Start with small number of users
- [ ] Monitor server resources
- [ ] Save test results
- [ ] Watch for errors
- [ ] Document findings

### After Testing
- [ ] Analyze results
- [ ] Identify bottlenecks
- [ ] Create performance report
- [ ] Clean up test resources
- [ ] Plan improvements

---

## Troubleshooting Guide

### Common JMeter Issues

**"Connection refused" error:**
- Check if StayMate is running
- Verify server URL and port
- Check firewall settings

**"Authentication failed" error:**
- Verify user credentials
- Check JWT token handling
- Ensure API endpoints are correct

**Out of memory errors:**
- Increase JMeter heap size
- Use non-GUI mode
- Reduce number of users

### Common AWS Issues

**High costs:**
- Check instance types
- Stop unused instances
- Review billing reports

**Slow performance:**
- Check instance size
- Monitor CPU usage
- Review network configuration

---

## Next Steps

### Advanced Testing
- Learn about distributed testing
- Set up CI/CD integration
- Create automated performance tests
- Monitor production performance

### Performance Optimization
- Database query optimization
- Caching strategies
- Load balancing configuration
- Auto-scaling setup

### Continuous Improvement
- Regular performance testing
- Performance budgets
- Monitoring and alerting
- Performance regression testing

---

## Conclusion

You now have everything you need to:
1. **Deploy StayMate on AWS** with a production-ready setup
2. **Load test your application** to ensure it handles real user traffic
3. **Monitor performance** and identify bottlenecks before users do
4. **Control costs** while testing in the cloud

Remember: Start small, test gradually, and always monitor your resources. Load testing is not just about finding breaking points - it's about ensuring a great user experience at scale.

Good luck with your StayMate deployment! 🚀
