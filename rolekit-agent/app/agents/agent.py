from langgraph.graph import StateGraph, START, END
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage, AIMessageChunk
from typing import TypedDict, List, AsyncGenerator

from app.core.dependencies import get_llm
from app.agents.tools.langchain_tools import cv_langchain_tools, set_bearer_token
import json

# Initialize the LLM with streaming enabled and bind tools
llm = get_llm()
llm_with_tools = llm.bind_tools(cv_langchain_tools)

# Define the state
class AgentState(TypedDict):
    messages: List[HumanMessage | AIMessage]


# Define a simple processing node (placeholder for complex logic)
def process_node(state: AgentState) -> AgentState:
    """
    Simple processing node - can be extended with complex logic.
    For now, it's a passthrough since we stream directly via get_agent_response_stream.
    """
    return state


# Build the graph with a basic node
graph = StateGraph(AgentState)
graph.add_node("process", process_node)
graph.add_edge(START, "process")
graph.add_edge("process", END)

# Compile the agent
agent = graph.compile()


async def get_agent_response_stream(query: str, conversation_id: str = None, cv_id: str = None, bearer_token: str = None) -> AsyncGenerator[str, None]:
    """
    Stream LLM response from the agent with tool calling support.
    This function handles the LLM interaction, tool execution, and yields chunks.
    
    Args:
        query: User's input query
        conversation_id: Optional conversation identifier
        cv_id: Optional CV/context identifier for personalized responses
        bearer_token: Required if cv_id is provided for API authentication
        
    Yields:
        SSE formatted events
    """
    from app.agents.nodes.streaming_node import stream_with_sse_format, create_content_delta_event, create_sse_event
    from agent.tools.cv_tools import create_cv_tools
    
    # Set the bearer token for tool use
    if bearer_token:
        set_bearer_token(bearer_token)
    
    # Fetch CV data if cv_id is provided
    cv_context = ""
    if cv_id:
        if not bearer_token:
            system_prompt = "Note: CV ID provided but no bearer token. Please provide a bearer token to access CV data."
        else:
            try:
                cv_tools = create_cv_tools(bearer_token)
                cv_result = await cv_tools.get_cv(cv_id)
                if cv_result.get("success") and cv_result.get("data"):
                    cv_context = cv_tools.format_cv_for_context(cv_result["data"])
                    # Inject CV context into the system message
                    system_prompt = f"""You are a helpful AI assistant with access to the user's CV information and tools to modify it.

Current CV Data:
{cv_context}

You can help the user:
1. Answer questions about their CV
2. Suggest improvements to their CV
3. Update their CV information using the available tools

Available Tools:
- get_cv_data: Fetch the latest CV data
- update_cv_personal_info: Update name, email, phone, location, title, or summary
- add_work_experience: Add a new work experience entry
- add_skill: Add a new skill

When the user asks to update their CV (e.g., "change my name to Ahmad"), use the appropriate tool to make the change.
The CV ID is: {cv_id}"""
                else:
                    system_prompt = f"Note: Could not fetch CV data (cv_id: {cv_id}). Error: {cv_result.get('error', 'Unknown error')}"
            except Exception as e:
                system_prompt = f"Note: Error loading CV data: {str(e)}"
    else:
        system_prompt = "You are a helpful AI assistant."
    
    # Create messages for LLM with context
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=query)
    ]
    
    # First LLM call with tools
    response = await llm_with_tools.ainvoke(messages)
    messages.append(response)
    
    # Check if there are tool calls
    if hasattr(response, 'tool_calls') and response.tool_calls:
        # Execute tool calls
        for tool_call in response.tool_calls:
            # Find and execute the tool
            tool_name = tool_call['name']
            tool_args = tool_call['args']
            tool_id = tool_call['id']
            
            # Add cv_id to tool args if not present and cv_id is available
            if 'cv_id' not in tool_args and cv_id:
                tool_args['cv_id'] = cv_id
            
            # Find the matching tool
            tool_func = None
            for tool in cv_langchain_tools:
                if tool.name == tool_name:
                    tool_func = tool
                    break
            
            if tool_func:
                try:
                    # Execute the tool
                    tool_result = await tool_func.ainvoke(tool_args)
                    
                    # Add tool result to messages
                    messages.append(ToolMessage(
                        content=str(tool_result),
                        tool_call_id=tool_id
                    ))
                    
                    # Stream a message about the tool execution
                    yield create_sse_event("delta", {
                        "o": "patch",
                        "p": [{"op": "add", "path": "/delta/text", "value": f"\n\n[Tool executed: {tool_name}]\n"}]
                    })
                    yield create_sse_event("delta", {
                        "o": "patch",
                        "p": [{"op": "add", "path": "/delta/text", "value": f"{tool_result}\n\n"}]
                    })
                    
                except Exception as e:
                    error_msg = f"Error executing tool {tool_name}: {str(e)}"
                    messages.append(ToolMessage(
                        content=error_msg,
                        tool_call_id=tool_id
                    ))
                    yield create_sse_event("delta", {
                        "o": "patch",
                        "p": [{"op": "add", "path": "/delta/text", "value": f"\n\n[Tool error: {error_msg}]\n\n"}]
                    })
        
        # Second LLM call to generate response based on tool results
        async for sse_event in stream_with_sse_format(llm.astream(messages), query, conversation_id):
            yield sse_event
    else:
        # No tool calls, stream the initial response
        async for sse_event in stream_with_sse_format(llm.astream(messages), query, conversation_id):
            yield sse_event
