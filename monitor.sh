#!/bin/bash

echo "🔍 RAG Document Management System - Service Monitor"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "💾 Database Status:"
if docker ps --format "table {{.Names}}" | grep -q "rag-postgres"; then
    echo "✅ PostgreSQL: Running"
    echo "   - Database: rag_db"
    echo "   - User: raguser"
    echo "   - Port: 5432"
else
    echo "❌ PostgreSQL: Not running"
fi

echo ""
echo "🔄 Backend Services:"
if docker ps --format "table {{.Names}}" | grep -q "rag-nestjs"; then
    echo "✅ NestJS Backend: Running (http://localhost:3000)"
else
    echo "❌ NestJS Backend: Not running"
fi

if docker ps --format "table {{.Names}}" | grep -q "rag-python"; then
    echo "✅ Python Backend: Running (http://localhost:8000)"
else
    echo "❌ Python Backend: Not running"
fi

echo ""
echo "⚛️  Frontend:"
if docker ps --format "table {{.Names}}" | grep -q "rag-frontend"; then
    echo "✅ Frontend: Running (http://localhost)"
else
    echo "❌ Frontend: Not running"
fi

echo ""
echo "📈 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo ""
echo "📝 Recent Logs (last 10 lines each):"
echo "====================================="

echo ""
echo "🔄 NestJS Backend Logs:"
docker-compose logs --tail=10 nestjs-backend

echo ""
echo "🐍 Python Backend Logs:"
docker-compose logs --tail=10 python-backend

echo ""
echo "⚛️  Frontend Logs:"
docker-compose logs --tail=10 frontend

echo ""
echo "💾 Database Logs:"
docker-compose logs --tail=10 postgres

echo ""
echo "🔗 Quick Access:"
echo "   - Frontend: http://localhost"
echo "   - NestJS API: http://localhost:3000"
echo "   - Python API: http://localhost:8000"
echo "   - Database: localhost:5432"
echo ""
echo "📋 Commands:"
echo "   - View all logs: docker-compose logs -f"
echo "   - Restart services: docker-compose restart"
echo "   - Stop all: ./stop.sh"
echo "   - Start all: ./start.sh" 