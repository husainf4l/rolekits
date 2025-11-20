# Agent Nodes

This directory contains modular node implementations for the LangGraph agent.

## Structure

- **streaming_node.py**: Handles SSE (Server-Sent Events) streaming with structured message format
  - Implements ChatGPT-style streaming protocol
  - Provides clean separation of concerns for streaming logic
  - Easy to extend with additional streaming features

## Best Practices

1. **Separation of Concerns**: Each node handles a specific responsibility
2. **Reusability**: Nodes can be composed in different graph configurations
3. **Error Handling**: Each node handles its own errors gracefully
4. **Type Safety**: Uses TypedDict for state management
5. **Documentation**: Well-documented functions with clear docstrings

## Usage

```python
from agent.nodes.streaming_node import stream_llm_response

# Stream a response
async for event in stream_llm_response("Hello, world!"):
    print(event)
```

## Future Nodes

- **tool_calling_node.py**: Handle tool/function calling
- **routing_node.py**: Route to different processing paths
- **validation_node.py**: Validate and sanitize inputs
- **memory_node.py**: Manage conversation memory
