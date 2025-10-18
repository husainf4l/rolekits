"""
Streaming node for LangGraph agent.
Handles SSE (Server-Sent Events) formatting with structured message format.
"""
from typing import AsyncGenerator
import json
import time
import uuid


def create_sse_event(event_type: str, data: dict) -> str:
    """
    Create a Server-Sent Event formatted string.
    
    Args:
        event_type: Type of event (e.g., 'delta', 'error')
        data: Event data to be JSON encoded
        
    Returns:
        Formatted SSE string
    """
    if event_type:
        return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
    return f"data: {json.dumps(data)}\n\n"


def create_user_message_event(query: str, conversation_id: str, request_id: str, counter: int) -> str:
    """
    Create the initial user mehttp://localhost:4003/graphqlssage event.
    
    Args:
        query: User's input query
        conversation_id: Unique conversation identifier
        request_id: Unique request identifier
        counter: Event counter
        
    Returns:
        SSE formatted user message event
    """
    event_data = {
        "v": {
            "message": {
                "id": str(uuid.uuid4()),
                "author": {"role": "user", "name": None, "metadata": {}},
                "create_time": time.time(),
                "update_time": None,
                "content": {"content_type": "text", "parts": [query]},
                "status": "finished_successfully",
                "metadata": {"request_id": request_id}
            },
            "conversation_id": conversation_id,
            "error": None
        },
        "c": counter
    }
    return create_sse_event("delta", event_data)


def create_assistant_start_event(message_id: str, conversation_id: str, request_id: str, counter: int) -> str:
    """
    Create the assistant message start event.
    
    Args:
        message_id: Unique message identifier
        conversation_id: Unique conversation identifier
        request_id: Unique request identifier
        counter: Event counter
        
    Returns:
        SSE formatted assistant start event
    """
    event_data = {
        "v": {
            "message": {
                "id": message_id,
                "author": {"role": "assistant", "name": None, "metadata": {}},
                "create_time": time.time(),
                "update_time": time.time(),
                "content": {"content_type": "text", "parts": [""]},
                "status": "in_progress",
                "metadata": {
                    "request_id": request_id,
                    "message_type": "next",
                    "model_slug": "gpt-4o-mini"
                }
            },
            "conversation_id": conversation_id,
            "error": None
        },
        "c": counter
    }
    return create_sse_event("delta", event_data)


def create_message_marker_event(conversation_id: str, message_id: str) -> str:
    """
    Create a message marker event for first visible token.
    
    Args:
        conversation_id: Unique conversation identifier
        message_id: Unique message identifier
        
    Returns:
        SSE formatted marker event
    """
    event_data = {
        "type": "message_marker",
        "conversation_id": conversation_id,
        "message_id": message_id,
        "marker": "user_visible_token",
        "event": "first"
    }
    return create_sse_event(None, event_data)


def create_content_delta_event(content_chunk: str) -> str:
    """
    Create a content delta event for streaming tokens.
    
    Args:
        content_chunk: New content to append
        
    Returns:
        SSE formatted delta event
    """
    event_data = {
        "o": "patch",
        "v": [
            {
                "p": "/message/content/parts/0",
                "o": "append",
                "v": content_chunk
            },
            {
                "p": "/message/update_time",
                "o": "replace",
                "v": time.time()
            }
        ]
    }
    return create_sse_event("delta", event_data)


def create_completion_event(message_id: str, conversation_id: str, request_id: str, 
                            accumulated_content: str, counter: int) -> str:
    """
    Create a completion event when streaming finishes.
    
    Args:
        message_id: Unique message identifier
        conversation_id: Unique conversation identifier
        request_id: Unique request identifier
        accumulated_content: Full message content
        counter: Event counter
        
    Returns:
        SSE formatted completion event
    """
    event_data = {
        "v": {
            "message": {
                "id": message_id,
                "author": {"role": "assistant", "name": None, "metadata": {}},
                "create_time": time.time(),
                "update_time": time.time(),
                "content": {"content_type": "text", "parts": [accumulated_content]},
                "status": "finished_successfully",
                "metadata": {
                    "request_id": request_id,
                    "message_type": "next",
                    "model_slug": "gpt-4o-mini"
                }
            },
            "conversation_id": conversation_id,
            "error": None
        },
        "c": counter
    }
    return create_sse_event("delta", event_data)


def create_error_event(error_message: str, conversation_id: str, counter: int) -> str:
    """
    Create an error event.
    
    Args:
        error_message: Error description
        conversation_id: Unique conversation identifier
        counter: Event counter
        
    Returns:
        SSE formatted error event
    """
    event_data = {
        "v": {
            "message": None,
            "conversation_id": conversation_id,
            "error": error_message
        },
        "c": counter
    }
    return create_sse_event("error", event_data)


async def stream_with_sse_format(llm_stream_generator, query: str, conversation_id: str = None) -> AsyncGenerator[str, None]:
    """
    Wrap an LLM stream generator with SSE formatting.
    
    Args:
        llm_stream_generator: Async generator that yields LLM chunks
        query: User's input query (for metadata)
        conversation_id: Optional conversation identifier
        
    Yields:
        SSE formatted events
    """
    # Initialize IDs
    if conversation_id is None:
        conversation_id = str(uuid.uuid4())
    
    message_id = str(uuid.uuid4())
    request_id = str(uuid.uuid4())
    counter = 1
    
    try:
        # 1. Send user message event
        yield create_user_message_event(query, conversation_id, request_id, counter)
        counter += 1
        
        # 2. Send assistant message start event
        yield create_assistant_start_event(message_id, conversation_id, request_id, counter)
        counter += 1
        
        # 3. Send first token marker
        yield create_message_marker_event(conversation_id, message_id)
        
        # 4. Stream the actual LLM response
        accumulated_content = ""
        
        try:
            # Stream tokens from LLM generator
            async for chunk in llm_stream_generator:
                if hasattr(chunk, 'content') and chunk.content:
                    accumulated_content += chunk.content
                    
                    # Send delta with the new content
                    yield create_content_delta_event(chunk.content)
            
            # 5. Send completion event
            yield create_completion_event(
                message_id, 
                conversation_id, 
                request_id, 
                accumulated_content, 
                counter
            )
            
        except Exception as llm_error:
            # Handle LLM-specific errors
            error_msg = f"Sorry, I encountered an error: {str(llm_error)}"
            yield create_content_delta_event(error_msg)
            yield create_completion_event(
                message_id, 
                conversation_id, 
                request_id, 
                error_msg, 
                counter
            )
            
    except Exception as e:
        # Handle general errors
        yield create_error_event(str(e), conversation_id, counter)
