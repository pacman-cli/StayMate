# A–Z Guide to Hosting StayMate on AWS

> **Assumptions Made:**
> - You have a domain name ready (or will register one)
> - You have basic understanding of web applications
> - You're deploying the existing StayMate codebase without modifications
> - You want a production-ready, scalable deployment

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

## P - Performance Optimization

### Step 1: Enable CloudFront CDN
1. CloudFront → Create distribution
2. Origin: Your ALB domain
3. Viewer protocol policy: Redirect HTTP to HTTPS
4. Cache behavior:
   - Path pattern: `/_next/static/*`
   - Cache TTL: 365 days
   - Compress: Yes

### Step 2: Optimize Database
```sql
-- Connect to RDS and run these optimizations
mysql -h your-rds-endpoint -u admin -p staymate_prod

-- Add indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_properties_location ON properties(city, state);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### Step 3: Configure Nginx Caching
Edit `/opt/staymate/deploy/nginx/staymate.conf`:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Step 4: Enable Gzip Compression
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

**Why optimization:** Faster load times, better user experience, lower costs.

---

## Q - Queue and Background Jobs

### Step 1: Set Up AWS SQS
1. SQS → Create queue
2. Queue name: `staymate-notifications`
3. Type: Standard
4. Create queue

### Step 2: Configure Email Service
1. SES → Create identity
2. Verify domain or email address
3. Move out of sandbox (request production access)

### Step 3: Update Application Configuration
Add to `.env`:
```env
# AWS SQS
AWS_SQS_QUEUE_URL=your-sqs-queue-url
AWS_REGION=us-east-1

# AWS SES
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
```

**Why queues:** Handle email notifications, image processing asynchronously.

---

## R - Monitoring and Logging

### Step 1: Enable CloudWatch Monitoring
1. CloudWatch → Log groups → Create log group
2. Name: `/aws/ec2/staymate-server`
3. Retention: 30 days

### Step 2: Install CloudWatch Agent
```bash
# Install CloudWatch agent
sudo apt install amazon-cloudwatch-agent -y

# Configure agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/staymate/cloudwatch-config.json -s
```

### Step 3: Create CloudWatch Alarms
1. CloudWatch → Alarms → Create alarm
2. Metrics to monitor:
   - CPUUtilization > 80%
   - MemoryUtilization > 85%
   - ELB 5XX errors > 5%
   - RDS CPU > 90%

### Step 4: Set Up Dashboards
1. CloudWatch → Dashboards → Create dashboard
2. Add widgets for:
   - EC2 metrics
   - RDS metrics
   - ALB metrics
   - Application logs

**Why monitoring:** Proactive issue detection, performance optimization.

---

## S - Security Hardening

### Step 1: Update System Security
```bash
# Update all packages
sudo apt update && sudo apt upgrade -y

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configure UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

### Step 2: Secure Database
```sql
-- Create application database user
CREATE USER 'staymate_app'@'%' IDENTIFIED BY 'strong-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON staymate_prod.* TO 'staymate_app'@'%';
FLUSH PRIVILEGES;
```

### Step 3: Enable AWS WAF
1. WAF & Shield → Create web ACL
2. Name: `staymate-waf`
3. Associate with ALB
4. Enable AWS managed rules:
   - Core rule set
   - Known bad inputs
   - SQL injection
   - XSS protection

### Step 4: Regular Security Updates
```bash
# Create update script
sudo nano /usr/local/bin/update-system.sh

#!/bin/bash
apt update && apt upgrade -y
docker-compose -f /opt/staymate/docker-compose.aws.yml pull
docker-compose -f /opt/staymate/docker-compose.aws.yml up -d

# Make executable
sudo chmod +x /usr/local/bin/update-system.sh

# Add to crontab for weekly updates
sudo crontab -e
# Add: 0 2 * * 0 /usr/local/bin/update-system.sh
```

**Why security:** Protect against common attacks and vulnerabilities.

---

## T - Testing and Validation

### Step 1: Functional Testing
```bash
# Test all API endpoints
curl -X GET https://yourdomain.com/api/auth/me
curl -X GET https://yourdomain.com/actuator/health
curl -X GET https://yourdomain.com/api/properties
```

### Step 2: Load Testing
```bash
# Install Apache Bench
sudo apt install apache2-utils -y

# Test API endpoint
ab -n 1000 -c 10 https://yourdomain.com/api/properties

# Test frontend
ab -n 1000 -c 10 https://yourdomain.com/
```

### Step 3: SSL Certificate Test
```bash
# Check SSL configuration
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Step 4: Database Connectivity Test
```bash
# Test database connection from application
docker exec staymate-backend-prod curl -f http://localhost:8080/actuator/health
```

**Why testing:** Ensure everything works before going live.

---

## U - User Data and Backups

### Step 1: Configure Automated Backups
1. RDS → Databases → staymate-db
2. Modify → Backup retention period: 7 days
3. Enable automated backups
4. Create snapshot: `staymate-initial-snapshot`

### Step 2: S3 Backup Configuration
```bash
# Create backup script
sudo nano /usr/local/bin/backup-s3.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h your-rds-endpoint -u admin -p staymate_prod > /tmp/backup_$DATE.sql
gzip /tmp/backup_$DATE.sql
aws s3 cp /tmp/backup_$DATE.sql.gz s3://staymate-backups/database/
rm /tmp/backup_$DATE.sql.gz

# Make executable
sudo chmod +x /usr/local/bin/backup-s3.sh

# Add to crontab for daily backups
sudo crontab -e
# Add: 0 3 * * * /usr/local/bin/backup-s3.sh
```

### Step 3: Create Backup Bucket
1. S3 → Create bucket: `staymate-backups-unique-name`
2. Enable versioning
3. Configure lifecycle policy (delete after 90 days)

**Why backups:** Prevent data loss, enable disaster recovery.

---

## V - VPC and Networking

### Step 1: Understand Current VPC
- Default VPC already created by AWS
- Public subnets in all AZs
- Internet gateway configured

### Step 2: Network Architecture Review
```
Internet Gateway
       ↓
   Route Table
       ↓
   Public Subnet
       ↓
EC2 Instance + ALB
       ↓
   Security Groups
```

### Step 3: Security Group Rules Review
```bash
# Check current security groups
aws ec2 describe-security-groups --group-names staymate-sg

# Verify only necessary ports are open
```

**Why VPC understanding:** Network security and connectivity.

---

## W - Web Server Configuration

### Step 1: Optimize Nginx Configuration
Edit `/opt/staymate/deploy/nginx/staymate.conf`:
```nginx
# Add rate limiting
http {
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=1r/s;

    # Add to server block
    location /api/auth/login {
        limit_req zone=login_limit burst=5 nodelay;
        proxy_pass http://backend;
    }
}
```

### Step 2: Enable HTTP/2
```nginx
listen 443 ssl http2;
```

### Step 3: Security Headers
```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

**Why web server optimization:** Performance, security, and reliability.

---

## X - Extra Services and Features

### Step 1: Enable AWS Shield
1. AWS Shield → Overview
2. Enable AWS Shield Standard (free)
3. Consider Shield Advanced for DDoS protection

### Step 2: Configure AWS Trusted Advisor
1. Trusted Advisor → Dashboard
2. Enable all checks
3. Review recommendations monthly

### Step 3: Set Up AWS Budgets
1. Billing → Budgets → Create budget
2. Cost budget: $100/month
3. Set alerts at 50%, 80%, 100%

### Step 4: Enable AWS Config
1. AWS Config → Get started
2. Record all resources
3. Enable AWS managed rules

**Why extra services:** Additional security, cost management, compliance.

---

## Y - Yearly Maintenance Tasks

### Monthly Tasks:
- Review CloudWatch alarms
- Check SSL certificate expiration
- Update application dependencies
- Review security groups
- Monitor costs

### Quarterly Tasks:
- Apply OS security patches
- Update Docker images
- Test backup restoration
- Performance optimization review

### Yearly Tasks:
- Review and update IAM policies
- Audit user access
- Disaster recovery testing
- Architecture review and optimization

### Automation Script:
```bash
# Create maintenance script
sudo nano /usr/local/bin/monthly-maintenance.sh

#!/bin/bash
echo "Starting monthly maintenance..."
apt update
docker system prune -f
aws s3 ls s3://staymate-backups/
echo "Maintenance complete"

# Add to crontab
sudo crontab -e
# Add: 0 4 1 * * /usr/local/bin/monthly-maintenance.sh
```

---

## Z - Zero Downtime Deployment

### Step 1: Blue-Green Deployment Strategy
```bash
# Create blue-green deployment script
sudo nano /opt/staymate/blue-green-deploy.sh

#!/bin/bash
CURRENT_ENV=$(docker-compose -f docker-compose.aws.yml ps -q server)
docker-compose -f docker-compose.aws.yml up -d --build --scale server=2
sleep 30
docker stop $CURRENT_ENV
docker rm $CURRENT_ENV

chmod +x /opt/staymate/blue-green-deploy.sh
```

### Step 2: Health Check Configuration
```yaml
# In docker-compose.aws.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

### Step 3: Rolling Update Process
```bash
# Update without downtime
docker-compose -f docker-compose.aws.yml up -d --no-deps --build server
sleep 30
docker-compose -f docker-compose.aws.yml up -d --no-deps --build frontend
```

### Step 4: Database Migration Strategy
```bash
# Safe migration script
sudo nano /opt/staymate/safe-migrate.sh

#!/bin/bash
echo "Starting safe migration..."
docker-compose -f docker-compose.aws.yml exec flyway migrate
if [ $? -eq 0 ]; then
    echo "Migration successful"
    ./deploy-aws.sh restart
else
    echo "Migration failed, rolling back..."
    docker-compose -f docker-compose.aws.yml exec flyway repair
fi
```

**Why zero downtime:** Continuous availability for users, professional deployment.

---

## Final Verification Checklist

### Pre-Launch Checklist:
- [ ] Domain pointing to ALB
- [ ] SSL certificate active
- [ ] Database connected and migrated
- [ ] All services healthy
- [ ] OAuth2 working
- [ ] File uploads working
- [ ] Email notifications configured
- [ ] Monitoring alerts set
- [ ] Backups configured
- [ ] Security groups locked down

### Post-Launch Monitoring:
- [ ] Check application logs
- [ ] Monitor error rates
- [ ] Watch performance metrics
- [ ] Verify user registration
- [ ] Test all features

### Cost Optimization:
- [ ] Right-size EC2 instance
- [ ] Enable S3 lifecycle policies
- [ ] Use Reserved Instances for long-term
- [ ] Monitor data transfer costs

---

## Common Beginner Mistakes to Avoid

1. **Using root account** - Always use IAM users
2. **Open security groups** - Restrict to specific IPs when possible
3. **Hardcoding credentials** - Use environment variables
4. **No backups** - Enable automated backups immediately
5. **Ignoring costs** - Set billing alerts from day one
6. **No monitoring** - Set up CloudWatch before launch
7. **Skipping SSL** - Always use HTTPS in production
8. **Default passwords** - Change all default credentials
9. **No testing** - Test thoroughly before going live
10. **Forgetting updates** - Set up regular maintenance

---

## Emergency Troubleshooting

### Application Won't Start:
```bash
# Check logs
./deploy-aws.sh logs server

# Check Docker status
docker ps -a

# Restart services
./deploy-aws.sh restart
```

### Database Connection Issues:
```bash
# Test connectivity
mysql -h your-rds-endpoint -u admin -p

# Check security groups
aws ec2 describe-security-groups
```

### High CPU Usage:
```bash
# Check processes
docker stats

# Scale up if needed
aws ec2 modify-instance-attribute --instance-id i-1234567890abcdef0 --instance-type "{\"Value\": \"t3.large\"}"
```

### SSL Certificate Issues:
```bash
# Check certificate
openssl s_client -connect yourdomain.com:443

# Renew certificate in ACM
```

---

## Cost Breakdown (Monthly Estimates)

| Service | Tier | Cost |
|---------|------|------|
| EC2 (t3.medium) | On-demand | $30 |
| RDS (db.t3.micro) | Free Tier | $0 |
| S3 Storage | 50GB | $1.50 |
| ALB | Data processing | $25 |
| Route 53 | Domain + queries | $15 |
| ACM | SSL Certificate | $0 |
| CloudFront | CDN | $10 |
| Data Transfer | 100GB | $9 |
| **Total** | | **~$90/month** |

**Cost-saving tips:**
- Use Reserved Instances for 1+ year commitments (30% savings)
- Enable S3 Intelligent-Tiering
- Optimize images and use CloudFront
- Monitor and right-size resources

---

## Congratulations! 🎉

Your StayMate application is now live on AWS with:
- ✅ High availability with load balancer
- ✅ SSL certificate and HTTPS
- ✅ Managed database with backups
- ✅ File storage with S3
- ✅ CDN for fast content delivery
- ✅ Monitoring and alerting
- ✅ Security hardening
- ✅ Zero-downtime deployment capability

### Next Steps:
1. Monitor performance and costs
2. Set up analytics and user tracking
3. Implement CI/CD pipeline
4. Add more monitoring and alerting
5. Plan for scaling as user base grows

### Support Resources:
- [AWS Documentation](https://docs.aws.amazon.com/)
- [AWS Support Center](https://aws.amazon.com/support/)
- [StayMate GitHub Repository](https://github.com/your-repo)
- [Community Forums](https://forums.aws.amazon.com/)

---

**Remember:** Cloud deployment is an ongoing process. Regular maintenance, monitoring, and optimization are key to success!
