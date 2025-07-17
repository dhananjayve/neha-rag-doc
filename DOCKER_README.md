# Docker Setup for RAG Document Management System

This document explains how to run the entire RAG Document Management System using Docker containers.

## 🏗️ Architecture

The system consists of 4 main components:

1. **Frontend (Angular)** - User interface
2. **NestJS Backend** - User management, document management, authentication
3. **Python Backend** - RAG processing, embeddings, Q&A
4. **PostgreSQL Database** - Data storage

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- At least 4GB of available RAM
- Ollama installed locally (for LLM functionality)

### Start All Services

```bash
./start.sh
```

This will:
- Build all Docker images
- Start PostgreSQL database
- Start NestJS backend
- Start Python backend  
- Start Angular frontend
- Wait for services to be ready

### Stop All Services

```bash
./stop.sh
```

### Monitor Services

```bash
./monitor.sh
```

This shows:
- Service status
- Resource usage
- Recent logs
- Quick access URLs

## 📊 Service Details

### Frontend (Angular)
- **URL**: http://localhost
- **Port**: 80
- **Container**: rag-frontend
- **Features**: User interface, document upload, Q&A interface

### NestJS Backend
- **URL**: http://localhost:3000
- **Port**: 3000
- **Container**: rag-nestjs
- **Features**: Authentication, user management, document management

### Python Backend
- **URL**: http://localhost:8000
- **Port**: 8000
- **Container**: rag-python
- **Features**: RAG processing, embeddings, Q&A generation

### PostgreSQL Database
- **Port**: 5432
- **Container**: rag-postgres
- **Database**: rag_db
- **User**: raguser
- **Password**: ragpass

## 🔧 Docker Commands

### View All Logs
```bash
docker-compose logs -f
```

### View Specific Service Logs
```bash
docker-compose logs -f nestjs-backend
docker-compose logs -f python-backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart python-backend
```

### Rebuild Services
```bash
# Rebuild all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build python-backend
```

### Access Container Shell
```bash
# Python backend
docker exec -it rag-python bash

# NestJS backend
docker exec -it rag-nestjs sh

# Database
docker exec -it rag-postgres psql -U raguser -d rag_db
```

## 📈 Resource Monitoring

### Check Resource Usage
```bash
docker stats
```

### Check Service Status
```bash
docker-compose ps
```

### View Container Details
```bash
docker inspect rag-python
```

## 🐛 Debugging

### Common Issues

1. **Port Conflicts**
   - Ensure ports 80, 3000, 8000, 5432 are available
   - Check with: `lsof -i :<port>`

2. **Memory Issues**
   - Monitor with: `docker stats`
   - Increase Docker memory limit if needed

3. **Database Connection Issues**
   - Check if PostgreSQL is ready: `docker-compose logs postgres`
   - Wait for health check to pass

4. **Build Failures**
   - Clean and rebuild: `docker-compose down && docker-compose up -d --build`

### Debug Commands

```bash
# Check if containers are running
docker ps

# Check container logs
docker-compose logs <service-name>

# Check container resource usage
docker stats --no-stream

# Access container for debugging
docker exec -it <container-name> bash
```

## 🔄 Development Workflow

### Making Changes

1. **Frontend Changes**
   - Edit files in `frontend/` directory
   - Rebuild: `docker-compose up -d --build frontend`

2. **NestJS Changes**
   - Edit files in `nestjs-backend/` directory
   - Rebuild: `docker-compose up -d --build nestjs-backend`

3. **Python Changes**
   - Edit files in `python-backend/` directory
   - Rebuild: `docker-compose up -d --build python-backend`

### Database Changes

1. **Schema Changes**
   - Add migration files to `db_schema/` directory
   - Restart: `docker-compose restart postgres`

2. **Data Persistence**
   - Data is stored in Docker volume: `postgres_data`
   - To reset: `docker-compose down -v && docker-compose up -d`

## 📁 File Structure

```
neha-coding/
├── docker-compose.yml          # Main orchestration file
├── start.sh                    # Start all services
├── stop.sh                     # Stop all services
├── monitor.sh                  # Monitor services
├── uploads/                    # Shared upload directory
├── frontend/
│   ├── Dockerfile             # Frontend container
│   ├── nginx.conf             # Nginx configuration
│   └── .dockerignore          # Exclude files from build
├── nestjs-backend/
│   ├── Dockerfile             # NestJS container
│   └── .dockerignore          # Exclude files from build
├── python-backend/
│   ├── Dockerfile             # Python container
│   ├── requirements.txt       # Python dependencies
│   └── .dockerignore          # Exclude files from build
└── db_schema/                 # Database migrations
```

## 🎯 Benefits of Docker Setup

1. **Isolation**: Each service runs in its own container
2. **Consistency**: Same environment across different machines
3. **Easy Deployment**: All dependencies are containerized
4. **Resource Monitoring**: Easy to track memory and CPU usage
5. **Debugging**: Isolated logs and easy access to containers
6. **Scalability**: Easy to scale individual services

## 🚨 Important Notes

1. **Ollama Requirement**: Make sure Ollama is running locally for LLM functionality
2. **Memory Requirements**: Each service needs adequate memory allocation
3. **Data Persistence**: Database data persists in Docker volumes
4. **Network**: Services communicate via Docker network
5. **Ports**: Ensure required ports are available on host machine

## 🔗 Quick Reference

| Service | URL | Port | Container |
|---------|-----|------|-----------|
| Frontend | http://localhost | 80 | rag-frontend |
| NestJS API | http://localhost:3000 | 3000 | rag-nestjs |
| Python API | http://localhost:8000 | 8000 | rag-python |
| Database | localhost:5432 | 5432 | rag-postgres | 