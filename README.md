# Document RAG System

A comprehensive document management and Q&A system built with Angular frontend, NestJS backend, Python RAG service, and PostgreSQL database.

## Features

- 📄 **Document Upload**: Support for PDF, DOC, DOCX, and TXT files
- 🔍 **Text Extraction**: Automatic text extraction from various file formats
- 🤖 **AI Q&A**: Powered by Google Gemini API for intelligent document queries
- 🔐 **User Authentication**: JWT-based authentication system
- 📊 **Document Management**: Upload, view, and manage documents
- 🚀 **Docker Support**: Easy deployment with Docker Compose

## Tech Stack

- **Frontend**: Angular 20 with Material Design
- **Backend**: NestJS with TypeScript
- **RAG Service**: Python with FastAPI
- **Database**: PostgreSQL with pgvector extension
- **AI**: Google Gemini API
- **Embeddings**: Ollama with nomic-embed-text model
- **Containerization**: Docker & Docker Compose

## Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm
- Python 3.10+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/dhananjayve/neha-rag-doc.git
cd neha-rag-doc
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env .env.local
```

Edit `.env.local` and add your API keys:

```env
# Application-wide environment variables
# DO NOT COMMIT REAL SECRETS TO GIT

GEMINI_API_KEY=your-real-gemini-api-key-here
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run serve
```

The frontend will be available at `http://localhost:4200`

### 4. Backend Setup

#### NestJS Backend

```bash
# Navigate to NestJS backend directory
cd nestjs-backend

# Install dependencies
npm install

# Start development server
npm run start:dev
```

The NestJS API will be available at `http://localhost:3000`

#### Python Backend

```bash
# Navigate to Python backend directory
cd python-backend

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
# .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the Python service
python main.py
```

The Python RAG service will be available at `http://localhost:8000`

### 5. Database Setup

The PostgreSQL database will be automatically set up when you run Docker Compose.

### 6. Docker Setup (Recommended)

For production or easy setup, use Docker Compose:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Usage

### 1. Start the System

#### Option A: Docker (Recommended)
```bash
docker-compose up -d
```

#### Option B: Manual Setup
```bash
# Terminal 1: Frontend
cd frontend && npm run serve

# Terminal 2: NestJS Backend
cd nestjs-backend && npm run start:dev

# Terminal 3: Python Backend
cd python-backend && source .venv/bin/activate && python main.py

# Terminal 4: Database (if not using Docker)
# Follow PostgreSQL setup instructions
```

### 2. Access the Application

- **Frontend**: http://localhost:4200
- **NestJS API**: http://localhost:3000
- **Python RAG API**: http://localhost:8000

### 3. Upload Documents

1. Navigate to the Documents section
2. Click "Upload Document"
3. Select your file (PDF, DOC, DOCX, TXT)
4. Wait for processing to complete

### 4. Ask Questions

1. Go to the Q&A section
2. Type your question about the uploaded documents
3. Get AI-powered answers based on document content

## Development

### Project Structure

```
neha-rag-doc/
├── frontend/                 # Angular application
│   ├── src/app/
│   │   ├── features/        # Feature modules
│   │   ├── shared/          # Shared components
│   │   └── store/           # NgRx store
├── nestjs-backend/          # NestJS API
│   └── src/
│       ├── auth/            # Authentication
│       ├── documents/       # Document management
│       ├── qa/              # Q&A endpoints
│       └── ingestion/       # Document processing
├── python-backend/          # Python RAG service
│   ├── main.py             # FastAPI application
│   ├── rag_service.py      # RAG implementation
│   └── requirements.txt    # Python dependencies
├── db_schema/              # Database schema
└── docker-compose.yml      # Docker configuration
```

### Adding New Features

1. **Frontend**: Add components in `frontend/src/app/features/`
2. **Backend**: Add modules in `nestjs-backend/src/`
3. **RAG Service**: Extend `python-backend/rag_service.py`

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3000, 4200, and 8000 are available
2. **Python Dependencies**: Make sure virtual environment is activated
3. **Database Connection**: Check if PostgreSQL is running
4. **API Keys**: Verify Gemini API key is set in `.env`

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f nestjs-backend
docker-compose logs -f python-backend
```

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the GitHub repository.