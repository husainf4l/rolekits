from fastapi import FastAPI, Header
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List

from app.core.config import settings
from app.agents.agent import get_agent_response_stream
from app.agents.tools.cv_tools import create_cv_tools
from app.api.routes.cv_routes import router as cv_router
from app.api.routes.phase2_routes import router as phase2_router

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered CV enhancement and management system - Phase 2"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(cv_router, prefix="/api/v1")  # Legacy routes
app.include_router(phase2_router)  # Phase 2 routes at /api/*

class QueryRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    cv_id: Optional[str] = None
    bearer_token: Optional[str] = None
    conversation_history: Optional[List[dict]] = None  # Add history support

class CVUpdateRequest(BaseModel):
    cv_id: str
    updates: dict


@app.get("/")
async def root():
    """Serve the main UI."""
    return FileResponse("static/index.html")
    return {
        "message": "Rolekit Agent API - Phase 2",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "chat": "/chat",
        "phase2_endpoints": {
            "extract": "/api/extract",
            "enhance": "/api/enhance",
            "build": "/api/build",
            "export": "/api/export",
            "feedback": "/api/feedback",
            "health": "/api/health"
        },
        "legacy_endpoints": "/api/v1/cv/*"
    }


@app.get("/cv/{cv_id}")
async def get_cv(cv_id: str, authorization: Optional[str] = Header(None)):
    """
    Fetch CV data from backend.
    Requires Bearer token in Authorization header.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return {"success": False, "error": "Missing or invalid Authorization header"}
    
    token = authorization.replace("Bearer ", "")
    cv_tools = create_cv_tools(token)
    result = await cv_tools.get_cv(cv_id)
    return result

@app.post("/cv/update")
async def update_cv(request: CVUpdateRequest, authorization: Optional[str] = Header(None)):
    """
    Update CV data via backend API.
    Requires Bearer token in Authorization header.
    
    Example body:
    {
        "cv_id": "123",
        "updates": {
            "personalInfo": {
                "fullName": "John Doe",
                "title": "Senior Developer"
            }
        }
    }
    """
    if not authorization or not authorization.startswith("Bearer "):
        return {"success": False, "error": "Missing or invalid Authorization header"}
    
    token = authorization.replace("Bearer ", "")
    cv_tools = create_cv_tools(token)
    result = await cv_tools.update_cv(request.cv_id, request.updates)
    return result

@app.get("/chat")
async def chat_page():
    """Serve the chat HTML page."""
    return FileResponse("app/static/chat.html", media_type="text/html")

async def simple_chat_stream(query: str, conversation_id: str = None, conversation_history: List[dict] = None):
    """
    Simplified streaming chat response that returns clean SSE events.
    Frontend expects: data: {"content": "text chunk"}\n\n
    
    Args:
        query: Current user query
        conversation_id: Unique conversation identifier
        conversation_history: List of previous messages [{"role": "user/assistant", "content": "..."}]
    """
    from app.core.dependencies import get_llm
    from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
    import json
    
    llm = get_llm()
    
    system_prompt = """You are a friendly and helpful AI CV Assistant. Your main purpose is to help users create professional CVs through natural conversation.

You can:
- Have natural conversations about career, work experience, and skills
- Help extract CV information from what users tell you
- Answer questions about CV writing best practices
- Provide career advice and suggestions
- Help improve and refine CV content

**IMPORTANT**: When users share their CV information (work experience, education, skills, contact details), acknowledge what you received briefly and encourage them to share more or ask if they want to see their CV. 

Example responses:
- "Great! I've noted your experience at [Company]. Tell me more about your achievements there, or share your education background."
- "Perfect! I've captured your skills in [domain]. Would you like to add more sections like projects or certifications?"
- "Excellent! I've recorded your information. Say 'show my CV' or 'generate CV' whenever you want to see the preview."

Be conversational, friendly, and helpful. Focus on GATHERING information efficiently rather than lengthy responses."""
    
    # Build message history
    messages = [SystemMessage(content=system_prompt)]
    
    # Add conversation history if provided (limit to last 10 messages to avoid context overflow)
    if conversation_history:
        recent_history = conversation_history[-10:]  # Keep last 10 messages
        for msg in recent_history:
            if msg.get('role') == 'user':
                messages.append(HumanMessage(content=msg.get('content', '')))
            elif msg.get('role') == 'assistant':
                messages.append(AIMessage(content=msg.get('content', '')))
    
    # Add current query
    messages.append(HumanMessage(content=query))
    
    async for chunk in llm.astream(messages):
        if hasattr(chunk, 'content') and chunk.content:
            # Send SSE formatted chunk
            event_data = {"content": chunk.content}
            yield f"data: {json.dumps(event_data)}\n\n"
    
    # Send completion marker
    yield "data: [DONE]\n\n"

@app.post("/api/query")
async def query_agent(request: QueryRequest):
    """
    Stream chat response from the LangGraph agent using SSE format.
    This endpoint provides natural language conversation for CV building.
    
    Body parameters:
    - query: User's message
    - conversation_id: Optional conversation identifier
    - conversation_history: Optional list of previous messages
    - cv_id: Optional CV/context identifier
    - bearer_token: Required if cv_id is provided
    """
    return StreamingResponse(
        simple_chat_stream(
            request.query, 
            request.conversation_id,
            request.conversation_history
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.post("/chat/stream")
async def chat_stream(request: QueryRequest):
    """
    Legacy endpoint - redirects to /api/query
    """
    return await query_agent(request)
