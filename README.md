# Document Management and RAG-based Q&A Application

A three-part application for managing users, documents, and providing RAG-based Q&A functionality.

## Project Structure

```
neha-coding/
├── python-backend/      # FastAPI - Document ingestion, embeddings, RAG Q&A
├── nestjs-backend/      # NestJS - User & document management, auth, ingestion trigger
├── frontend/            # Angular (Nx) - User interface
└── db_schema/           # Database schema files
```

## Components

### 1. Python Backend (Document Ingestion and RAG Q&A)
- **Purpose**: Handle document ingestion, embedding generation, and RAG-based Q&A
- **Key APIs**:
  - Document Ingestion API: Accept documents, generate embeddings, store for retrieval
  - Q&A API: Accept questions, retrieve relevant documents, generate answers using RAG
  - Document Selection API: Allow users to specify documents for Q&A context
- **Tech Stack**: FastAPI, asyncpg, SQLAlchemy, LLM libraries (OpenAI/HuggingFace)

### 2. NestJS Backend (User Management and Document Management)
- **Purpose**: Manage user authentication, document management, and ingestion controls
- **Key APIs**:
  - Authentication APIs: Register, login, logout, role management (admin, editor, viewer)
  - User Management APIs: Admin functionality for managing users and permissions
  - Document Management APIs: CRUD operations for documents
  - Ingestion Trigger API: Trigger ingestion process in Python backend
  - Ingestion Management API: Track and manage ongoing ingestion processes
- **Tech Stack**: NestJS, TypeScript, TypeORM/Prisma, JWT, Postgres

### 3. Angular Frontend (User Interface)
- **Purpose**: Provide user interface for management and Q&A interactions
- **Key Features**:
  - Authentication pages (sign up, login, logout)
  - User management (admin only)
  - Document upload and management
  - Ingestion management (trigger, monitor)
  - Q&A interface (ask questions, receive answers, show relevant excerpts)
- **Tech Stack**: Angular, Nx workspace, Angular Material, RxJS

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- PostgreSQL
- Conda (for Python environment management)

### Setup Instructions

1. **Python Backend**
   ```bash
   cd python-backend
   conda activate rag-python-backend
   # Install dependencies (already done)
   # Start development server
   uvicorn main:app --reload
   ```

2. **NestJS Backend**
   ```bash
   cd nestjs-backend
   npm install
   npm run start:dev
   ```

3. **Angular Frontend**
   ```bash
   cd frontend
   npm install
   npx nx serve app
   ```

## Development Status

- ✅ Project scaffolding completed
- 🔄 Database schema design (in progress)
- ⏳ Authentication implementation
- ⏳ Document management
- ⏳ RAG implementation
- ⏳ Frontend development
- ⏳ Testing and documentation

## API Documentation

- Python Backend: `http://localhost:8000/docs` (FastAPI auto-generated)
- NestJS Backend: `http://localhost:3000/api` (Swagger/OpenAPI)

## Contributing

1. Follow the established project structure
2. Use TypeScript for NestJS and Angular components
3. Implement proper error handling and validation
4. Write tests for all new functionality
5. Update documentation as needed 