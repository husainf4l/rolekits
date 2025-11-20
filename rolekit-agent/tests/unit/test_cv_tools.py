"""
Simple test script to verify CV tools work with the correct schema
"""
import asyncio
import sys
sys.path.insert(0, '/home/husain/rolekits/rolekit-agent')

from app.agents.tools.cv_tools import create_cv_tools

async def test_cv_tools():
    bearer_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imh1c2FpbiIsInN1YiI6ImQwOWVjMjE1LTc2NzAtNDA0Yy05YjhjLTY3NWM5YWExNjM2YiIsImlhdCI6MTc2MDYxNTQ5NSwiZXhwIjoxNzYwNjE3Mjk1fQ.TRbNHKm3K4i1Sr9ONoIbwsOhMm4l6h6_NWsRXUhOte0"
    cv_id = "5a7f3d0f-befa-4c2d-9f0d-603db5bc8eb8"
    
    cv_tools = create_cv_tools(bearer_token)
    
    print("=== Testing GET CV ===")
    result = await cv_tools.get_cv(cv_id)
    print(f"Success: {result.get('success')}")
    if result.get('success'):
        print("CV Data retrieved successfully!")
        formatted = cv_tools.format_cv_for_context(result['data'])
        print(formatted[:500] + "..." if len(formatted) > 500 else formatted)
    else:
        print(f"Error: {result.get('error')}")
    
    print("\n=== Testing UPDATE CV (change name to Ahmad) ===")
    update_result = await cv_tools.update_cv(cv_id, {"fullName": "Ahmad"})
    print(f"Success: {update_result.get('success')}")
    if update_result.get('success'):
        print("CV Updated successfully!")
        print(f"Updated data: {update_result.get('data')}")
    else:
        print(f"Error: {update_result.get('error')}")

if __name__ == "__main__":
    asyncio.run(test_cv_tools())
