-- Add file content storage fields to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_content BYTEA;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size BIGINT; 