#!/bin/bash

echo "🚀 Starting RAG Document Management System..."

# Create uploads directory if it doesn't exist
# mkdir -p uploads

# Build and start all services
echo "📦 Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

echo "✅ Services started successfully!"
echo ""
echo "🌐 Access the application at: http://localhost"
echo "📊 Monitor services with: docker-compose logs -f"
echo "🛑 Stop services with: ./stop.sh" 