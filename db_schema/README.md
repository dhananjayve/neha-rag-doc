# Database Schema

This folder contains the database schema files for the Document Management & RAG Q&A application.

## Files

- `base_schema.sql` - The base database schema that creates all necessary tables and indexes for the application

## Usage

The schema is automatically applied when running the application using `./start.sh` or `./start_postgres.sh`.

## Tables

The schema creates the following tables:
- `users` - User authentication and profile information
- `documents` - Document metadata and content
- `ingestion_status` - Document ingestion processing status

## Notes

- This schema is designed for PostgreSQL with the pgvector extension
- The schema includes proper indexes for performance
- All tables use UUID primary keys for scalability 