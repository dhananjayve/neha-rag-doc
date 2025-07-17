from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import get_db, Document, DocumentStatus, engine
from rag_service import RAGService
import uuid
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Document Management and RAG Q&A API",
    description="Python backend for document ingestion and RAG-based Q&A",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:4200", "http://frontend"],  # Allow both Docker and dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG service
rag_service = RAGService()

@app.on_event("startup")
async def startup_event():
    """Check database connectivity on startup"""
    logger.info("Checking database connectivity...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(lambda sync_conn: sync_conn.execute(text("SELECT 1")))
        logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise e

# Pydantic models
class DocumentIngestRequest(BaseModel):
    document_id: str

class DocumentIngestResponse(BaseModel):
    status: str
    message: str
    embeddings_count: Optional[int] = None

class QARequest(BaseModel):
    question: str
    document_ids: Optional[List[str]] = None

class QAResponse(BaseModel):
    question: str
    answer: str
    relevant_documents: List[str]
    confidence: float

class DocumentSelectionRequest(BaseModel):
    document_ids: List[str]

@app.get("/")
async def root():
    return {"message": "Document Management and RAG Q&A API"}

@app.get("/health")
async def health_check():
    """Health check endpoint that tests database connectivity"""
    try:
        # Test database connection
        async with engine.begin() as conn:
            await conn.run_sync(lambda sync_conn: sync_conn.execute(text("SELECT 1")))
        
        return {
            "status": "healthy", 
            "service": "python-backend",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "service": "python-backend", 
            "database": "disconnected",
            "error": str(e)
        }

@app.post("/ingest", response_model=DocumentIngestResponse)
async def ingest_document(
    request: DocumentIngestRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest a document, generate embeddings, and store for retrieval.
    """
    try:
        logger.info(f"Starting ingestion for document: {request.document_id}")
        
        # Process document using RAG service
        result = await rag_service.process_document(db, request.document_id)
        
        logger.info(f"Ingestion completed for document {request.document_id}: {result}")
        
        return DocumentIngestResponse(
            status=result["status"],
            message=result["message"],
            embeddings_count=result.get("embeddings_count")
        )
    except Exception as e:
        logger.error(f"Error in ingest endpoint: {str(e)}")
        logger.error(f"Full error details: {type(e).__name__}: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/qa", response_model=QAResponse)
async def ask_question(
    request: QARequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Ask a question and get RAG-based answer.
    """
    try:
        # Get answer using RAG service
        result = await rag_service.answer_question(db, request.question, request.document_ids)
        
        return QAResponse(
            question=request.question,
            answer=result["answer"],
            relevant_documents=result["relevant_documents"],
            confidence=result["confidence"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents/select")
async def select_documents(request: DocumentSelectionRequest):
    """
    Allow users to specify which documents to consider in Q&A.
    """
    try:
        # For now, just return success message
        # In a real implementation, this would store user preferences
        
        return {
            "status": "success",
            "message": f"Selected {len(request.document_ids)} documents for Q&A"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def list_documents(db: AsyncSession = Depends(get_db)):
    """
    List all documents with their ingestion status.
    """
    try:
        from sqlalchemy import select
        stmt = select(Document)
        result = await db.execute(stmt)
        documents = result.scalars().all()
        
        return {
            "documents": [
                {
                    "id": str(doc.id),
                    "title": doc.title,
                    "status": doc.status.value,
                    "created_at": doc.created_at.isoformat()
                }
                for doc in documents
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """Extract text from uploaded file"""
    try:
        file_content = await file.read()
        mime_type = file.content_type or "application/octet-stream"
        
        # Use the same extraction logic as in RAG service
        extracted_text = rag_service.extract_text_from_file(file_content, mime_type)
        
        return {"extracted_text": extracted_text}
    except Exception as e:
        logger.error(f"Error in text extraction endpoint: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 