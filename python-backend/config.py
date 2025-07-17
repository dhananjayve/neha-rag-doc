import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = "postgresql+asyncpg://raguser:ragpass@postgres/rag_db"
    
    # API settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # CORS settings
    CORS_ORIGINS: list = ["http://localhost:4200"]  # Angular dev server
    
    # LLM settings
    GEMINI_API_KEY: str = ""  # Must be set in .env
    
    # Ollama settings (for embeddings only)
    OLLAMA_BASE_URL: str = "http://ollama:11434"
    EMBEDDING_MODEL: str = "nomic-embed-text"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    
    class Config:
        env_file = "../.env"

settings = Settings() 