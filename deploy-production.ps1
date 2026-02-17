# Production Deployment Script for Windows
# Run this with: .\deploy-production.ps1

Write-Host "🚀 Starting Production Deployment..." -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "📝 Please create .env file from .env.production.example" -ForegroundColor Yellow
    exit 1
}

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Build and start containers
Write-Host "🔨 Building and starting containers..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml up -d --build

# Show status
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "📊 Container status:" -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml ps

# Show logs
Write-Host ""
Write-Host "📝 Viewing logs (Ctrl+C to exit)..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml logs -f
