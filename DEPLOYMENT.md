# Production Deployment Guide

## Overview

This guide explains how to deploy the application in production mode.

## Branch Structure

- `main` - Production-ready code (deploy from here)
- `develop` - Development version with debug features
- `db-changes` - Database changes branch

## Prerequisites

- Docker and Docker Compose installed on server
- Domain name configured (DNS pointing to server)
- SSL certificate (recommended: Let's Encrypt)

## Deployment Steps

### 1. Prepare Environment File

Copy the example environment file and fill in production values:

```bash
cp .env.production.example .env
```

Edit `.env` with your actual production values:

- `FRONTEND_URL` - Your actual domain (e.g., https://otazky.uniza.sk)
- `SALT_KEY` - Generate a new secure key
- `TOKEN_KEY` - Generate a new secure key (different from SALT_KEY)
- `MONGO_PASSWORD` - Strong password for MongoDB
- `SMTP_*` - Your email configuration (if not already working)

**Security Keys Generation:**

```bash
# Generate secure random keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Deploy Application

**On Linux/Mac:**

```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

**On Windows:**

```powershell
.\deploy-production.ps1
```

**Or manually:**

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3. Verify Deployment

Check container status:

```bash
docker-compose -f docker-compose.prod.yml ps
```

View logs:

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. SSL/HTTPS Setup (Recommended)

For production, you should use HTTPS. Use a reverse proxy like Nginx or Caddy with Let's Encrypt:

**Example with Certbot:**

```bash
sudo certbot --nginx -d yourdomain.com
```

## Key Differences: Development vs Production

### Development (develop branch)

- Uses `docker-compose.yml`
- Uses `Dockerfile.dev` files
- Hot-reloading enabled
- Debug controls visible
- MongoDB port exposed (29035)
- Source code mounted as volumes
- `FRONTEND_URL=http://localhost:3000`

### Production (main branch)

- Uses `docker-compose.prod.yml`
- Uses production `Dockerfile` files
- Optimized builds
- Debug controls hidden/disabled
- MongoDB NOT exposed externally
- Code built into images
- `FRONTEND_URL=https://yourdomain.com`

## Maintenance Commands

### Update deployment

```bash
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

### View logs

```bash
docker-compose -f docker-compose.prod.yml logs -f [service-name]
```

### Stop application

```bash
docker-compose -f docker-compose.prod.yml down
```

### Backup database

```bash
docker exec -it dp_otazkovysystem-mongo-1 mongodump --out /backup/$(date +%Y%m%d_%H%M%S)
```

### Restart specific service

```bash
docker-compose -f docker-compose.prod.yml restart backend
```

## Troubleshooting

### Email confirmation not working

- Verify `FRONTEND_URL` matches your actual domain
- Check SMTP credentials in `.env`
- View backend logs: `docker-compose -f docker-compose.prod.yml logs backend`

### Cannot connect to database

- Verify MongoDB credentials in `.env`
- Check if mongo container is running
- View mongo logs: `docker-compose -f docker-compose.prod.yml logs mongo`

### Application not accessible

- Check if containers are running: `docker-compose -f docker-compose.prod.yml ps`
- Verify port 3000 is open on your firewall
- Check nginx logs: `docker-compose -f docker-compose.prod.yml logs proxy`

## Security Checklist

- [ ] `.env` file is NOT committed to git
- [ ] New SALT_KEY and TOKEN_KEY generated (different from dev)
- [ ] Strong MongoDB password set
- [ ] FRONTEND_URL uses HTTPS
- [ ] MongoDB port NOT exposed externally
- [ ] SSL certificate installed
- [ ] Firewall configured (only 80, 443 open)
- [ ] Regular database backups scheduled
