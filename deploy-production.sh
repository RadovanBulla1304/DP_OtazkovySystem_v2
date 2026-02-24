#!/bin/bash

# Production Deployment Script
# This script deploys the application using production configurations

echo "Starting Production Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please create .env file from .env.production.example"
    exit 1
fi

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Remove old images (optional - uncomment if you want to rebuild from scratch)
# echo "🗑️  Removing old images..."
# docker-compose -f docker-compose.prod.yml rm -f

# Build and start containers
echo "Building and starting containers..."
docker-compose up -d --build

# Show status
echo "Deployment complete!"
echo "Container status:"
docker-compose ps

# Show logs
echo ""
echo "Viewing logs (Ctrl+C to exit)..."
docker-compose logs -f
