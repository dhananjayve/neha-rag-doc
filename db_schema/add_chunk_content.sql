-- Create embeddings table if it doesn't exist
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add chunk_content field to embeddings table
ALTER TABLE embeddings ADD COLUMN IF NOT EXISTS chunk_content TEXT; 