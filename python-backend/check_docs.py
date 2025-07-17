import asyncio
from database import get_db, Document
from sqlalchemy import select

async def check_docs():
    async for session in get_db():
        result = await session.execute(select(Document))
        docs = result.scalars().all()
        print(f'Found {len(docs)} documents:')
        for doc in docs:
            print(f'- {doc.title}: {doc.status}')
            print(f'  Content preview: {doc.content[:100]}...')
        break

if __name__ == "__main__":
    asyncio.run(check_docs()) 