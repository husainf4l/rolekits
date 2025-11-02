"""
Test script to verify the agent is using the LLM correctly
"""
import asyncio
from dotenv import load_dotenv
load_dotenv()

from agent.agent import get_agent_response_stream


async def test_agent():
    """Test the agent's LLM integration"""
    
    print("=" * 60)
    print("Testing Agent LLM Integration")
    print("=" * 60)
    
    # Test 1: Simple query without CV context
    print("\n📝 Test 1: Simple greeting")
    print("-" * 60)
    
    query = "Say hello and tell me your purpose in one sentence"
    conversation_id = "test_conv_001"
    
    accumulated_content = ""
    event_count = 0
    
    async for event in get_agent_response_stream(query, conversation_id):
        event_count += 1
        # Parse SSE events to extract content
        if "data: " in event:
            import json
            try:
                data = json.loads(event.split("data: ")[1].strip())
                if data.get("o") == "patch" and data.get("v"):
                    for patch in data["v"]:
                        if patch.get("p") == "/message/content/parts/0" and patch.get("o") == "append":
                            content = patch.get("v", "")
                            accumulated_content += content
                            print(content, end="", flush=True)
            except:
                pass
    
    print(f"\n\n✓ Test completed!")
    print(f"  - Events received: {event_count}")
    print(f"  - Content length: {len(accumulated_content)} chars")
    print(f"  - Response: {accumulated_content[:100]}..." if len(accumulated_content) > 100 else f"  - Response: {accumulated_content}")
    
    # Verify LLM is working
    if accumulated_content and len(accumulated_content) > 10:
        print("\n✅ SUCCESS: Agent is using LLM and generating responses!")
        return True
    else:
        print("\n❌ FAILED: Agent did not generate proper response")
        return False


if __name__ == "__main__":
    result = asyncio.run(test_agent())
    exit(0 if result else 1)
