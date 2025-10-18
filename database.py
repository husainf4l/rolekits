from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from config import settings

SQLALCHEMY_DATABASE_URL = settings.database_url

# Create async engine for PostgreSQL or regular for SQLite
if SQLALCHEMY_DATABASE_URL.startswith("postgresql://"):
    # Convert to async postgresql URL
    ASYNC_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(ASYNC_DATABASE_URL, echo=False)
    AsyncSessionLocal = async_sessionmaker(
        engine, 
        class_=AsyncSession, 
        expire_on_commit=False
    )
    # For migrations, create sync engine
    sync_engine = create_engine(SQLALCHEMY_DATABASE_URL)
elif SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    sync_engine = engine
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    sync_engine = engine
