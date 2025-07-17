from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, Text, DateTime, UUID, Enum as SQLEnum, Integer
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from datetime import datetime
import enum
from typing import AsyncGenerator
from config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,  # Set to False in production
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Enum for document status
class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    INGESTED = "ingested"
    FAILED = "failed"
    
    @classmethod
    def _missing_(cls, value):
        # Handle case variations
        for member in cls:
            if member.value.lower() == value.lower():
                return member
        return None

# Create the enum type for PostgreSQL
DocumentStatusEnum = SQLEnum(
    DocumentStatus,
    name="documents_status_enum",
    native_enum=False,
    values_callable=lambda x: [e.value for e in x]
)

# Database models
class Document(Base):
    __tablename__ = "documents"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True)
    title = Column(String(256), nullable=False)
    content = Column(Text, nullable=False)
    owner_id = Column(PostgresUUID(as_uuid=True), nullable=True)
    status = Column(DocumentStatusEnum, default=DocumentStatus.PENDING.value)
    created_at = Column(DateTime, default=datetime.utcnow)

class Embedding(Base):
    __tablename__ = "embeddings"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True)
    document_id = Column(PostgresUUID(as_uuid=True), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    embedding = Column(Text, nullable=False)  # Store as JSON string for Ollama embeddings
    chunk_content = Column(Text, nullable=True)  # Store the actual chunk content
    created_at = Column(DateTime, default=datetime.utcnow)

# Dependency to get database session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close() 