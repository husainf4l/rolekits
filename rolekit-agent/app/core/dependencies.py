"""
FastAPI dependencies for dependency injection.
"""
from functools import lru_cache
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from app.core.config import settings


@lru_cache()
def get_llm() -> ChatOpenAI:
    """Get OpenAI LLM instance."""
    return ChatOpenAI(
        model=settings.OPENAI_MODEL,
        temperature=settings.OPENAI_TEMPERATURE,
        openai_api_key=settings.OPENAI_API_KEY,
        streaming=True
    )


@lru_cache()
def get_embeddings() -> OpenAIEmbeddings:
    """Get OpenAI embeddings instance."""
    return OpenAIEmbeddings(
        model=settings.OPENAI_EMBEDDING_MODEL,
        openai_api_key=settings.OPENAI_API_KEY
    )
