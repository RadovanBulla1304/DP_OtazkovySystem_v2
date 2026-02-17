# Otázkový Systém - Question Management System

A web-based question management system for educational purposes built with React, Node.js, Express, and MongoDB.

## Branch Structure

- **`main`** - Production branch (deploy from here)
- **`develop`** - Development branch with debug features
- **`db-changes`** - Database schema changes

## Quick Start

### Development Mode (on `develop` branch)

```bash
# Switch to develop branch
git checkout develop

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

Access: http://localhost:3000

### Production Mode (on `main` branch)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment guide.

```bash
# On main branch
git checkout main

# Configure environment
cp .env.production.example .env
# Edit .env with your production values

# Deploy
docker-compose up -d --build

# Or use deployment script
.\deploy-production.ps1  # Windows
./deploy-production.sh   # Linux/Mac
```

## Project Structure

```
.
├── apps/
│   ├── backend/          # Node.js/Express API
│   ├── frontend/         # React application
│   ├── nginx/            # Nginx reverse proxy
│   └── entry_point/      # MongoDB initialization
├── volumes/
│   ├── backend/          # MongoDB data
│   └── backups/          # Database backups
├── docker-compose.yml           # Production compose (main branch)
├── docker-compose.dev.yml       # Development compose (develop branch)
├── docker-compose.prod.yml      # Production compose template
└── DEPLOYMENT.md                # Deployment guide
```

## Features

- User registration and authentication
- Email confirmation
- Question creation and management
- Weekly question assignments
- Question validation system
- Point tracking system
- Module and subject management
- Admin dashboard

## Environment Variables

Create `.env` file with required variables:

```env
# Frontend URL
FRONTEND_URL=http://localhost:3000  # or your production domain

# Email Configuration (if already working on server, leave as is)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.sk

# Security Keys
SALT_KEY=your-salt-key-here
TOKEN_KEY=your-token-key-here

# MongoDB
MONGO_USER=mongoUser
MONGO_PASSWORD=your-password
```

## Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Docker Compose | `docker-compose.dev.yml` | `docker-compose.yml` |
| Dockerfiles | `Dockerfile.dev` | `Dockerfile` |
| Hot Reload | ✅ Yes | ❌ No |
| Debug Controls | ✅ Visible | ⚠️ Should be disabled |
| MongoDB Port | Exposed (29035) | Not exposed |
| Code Volumes | Mounted | Built into image |
| Optimization | Low | High |

## Common Commands

### Development
```bash
# Start
docker-compose -f docker-compose.dev.yml up -d

# Stop
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Rebuild
docker-compose -f docker-compose.dev.yml up -d --build
```

### Production
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Update deployment
git pull origin main
docker-compose up -d --build
```

## Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [todo.txt](todo.txt) - Development todos
- [bugy.txt](bugy.txt) - Known bugs and issues

## License

[Your License Here]

## Contributors

[Your Contributors Here]
