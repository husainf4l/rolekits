from fastapi import FastAPI, Header
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from typing import Optional

# Load environment variables
load_dotenv()

from agent.agent import get_agent_response_stream
from agent.tools.cv_tools import create_cv_tools

app = FastAPI(title="Rolekit Agent", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    conversation_id: str = None
    cv_id: str = None
    bearer_token: str = None

class CVUpdateRequest(BaseModel):
    cv_id: str
    updates: dict

@app.get("/")
async def root():
    return {"message": "Rolekit Agent API"}

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
    """Serve the chat HTML page"""
    return FileResponse("chat.html", media_type="text/html")

@app.post("/chat/stream")
async def chat_stream(request: QueryRequest):
    """
    Stream chat response from the LangGraph agent using SSE format.
    
    Body parameters:
    - query: User's message
    - conversation_id: Optional conversation identifier
    - cv_id: Optional CV/context identifier
    - bearer_token: Required if cv_id is provided
    """
    return StreamingResponse(
        get_agent_response_stream(
            request.query, 
            request.conversation_id,
            request.cv_id,
            request.bearer_token
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
