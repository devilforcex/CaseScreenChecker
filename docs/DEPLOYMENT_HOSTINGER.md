# CaseScreenChecker — Hostinger VPS & GitHub Deployment Guide

This document outlines the exact, step-by-step procedure to deploy the **CaseScreenChecker** full-stack application onto a **Hostinger VPS** (Ubuntu / Debian) directly from your GitHub repository.

---

## 📋 Prerequisites on Hostinger VPS

Connect to your VPS via SSH:
```bash
ssh root@<YOUR_VPS_IP>
```

Update packages:
```bash
sudo apt update && sudo apt upgrade -y
```

---

## 🚀 Deployment Option A: Native Node.js & PM2 (Recommended)

### 1. Install Node.js 20 LTS & PM2
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

# Verify versions
node -v # Should be v20.x.x
npm -v

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

### 2. Clone GitHub Repository into `/root/CaseScreenChecker`
```bash
cd /root
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git CaseScreenChecker
cd CaseScreenChecker
```

### 3. Install Dependencies & Build Application
```bash
npm ci
npm run build
```

### 4. Import SQL Database (Optional / If PostgreSQL is installed)
```bash
# To import the schema and seeds into your PostgreSQL instance:
psql -U postgres -d casescreenchecker -f sql/schema.sql
psql -U postgres -d casescreenchecker -f sql/seeds.sql
```

### 5. Start with PM2
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 6. Setup Nginx Reverse Proxy
```bash
sudo apt install -y nginx

# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/casescreenchecker
sudo ln -s /etc/nginx/sites-available/casescreenchecker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Install Free SSL Certificate (Let's Encrypt / Certbot)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🐳 Deployment Option B: Docker & Docker Compose

If you prefer containerized deployment:

### 1. Install Docker & Docker Compose
```bash
sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
```

### 2. Clone and Start
```bash
cd /root
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git CaseScreenChecker
cd CaseScreenChecker

# Build and start container in detached background mode
docker-compose up -d --build
```

---

## 🔄 Updating the App After Git Commits

To pull updates from GitHub and reload the VPS without downtime:

```bash
cd /root/CaseScreenChecker
git pull origin main
npm ci
npm run build
pm2 reload casescreenchecker
```

---

## 🔍 Verifying the Service

- Open your browser at `http://<YOUR_VPS_IP>` or `https://yourdomain.com`
- Check REST API health endpoint: `curl http://localhost:3000/api/health`
- Check PM2 status: `pm2 status` or `pm2 logs casescreenchecker`
