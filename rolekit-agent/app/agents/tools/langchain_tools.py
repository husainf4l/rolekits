"""
LangChain tool wrappers for CV operations.
Provides structured tools that can be used by the LLM agent.
"""
from langchain_core.tools import tool
from typing import Dict, Any, Optional
import json


# Global variable to store the bearer token for the current request
_current_bearer_token: Optional[str] = None


def set_bearer_token(token: str):
    """Set the bearer token for CV operations."""
    global _current_bearer_token
    _current_bearer_token = token


def get_bearer_token() -> Optional[str]:
    """Get the current bearer token."""
    return _current_bearer_token


@tool
async def get_cv_data(cv_id: str) -> str:
    """
    Fetch CV data from the backend.
    
    Use this tool when you need to get current CV information to answer questions
    or before making updates.
    
    Args:
        cv_id: The CV identifier
        
    Returns:
        Formatted CV data as a string
    """
    from app.agents.tools.cv_tools import create_cv_tools
    
    token = get_bearer_token()
    if not token:
        return "Error: No bearer token available. Cannot fetch CV data."
    
    try:
        cv_tools = create_cv_tools(token)
        result = await cv_tools.get_cv(cv_id)
        
        if result.get("success") and result.get("data"):
            formatted = cv_tools.format_cv_for_context(result["data"])
            return f"Successfully fetched CV data:\n\n{formatted}"
        else:
            return f"Error fetching CV: {result.get('error', 'Unknown error')}"
    except Exception as e:
        return f"Error fetching CV: {str(e)}"


@tool
async def update_cv_personal_info(
    cv_id: str,
    full_name: Optional[str] = None,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    address: Optional[str] = None,
    summary: Optional[str] = None
) -> str:
    """
    Update personal information in a CV.
    
    Use this tool when the user asks to change their name, email, phone, address,
    or professional summary.
    
    Args:
        cv_id: The CV identifier
        full_name: New full name (optional)
        email: New email address (optional)
        phone: New phone number (optional)
        address: New location/address (optional)
        summary: New professional summary (optional)
        
    Returns:
        Success or error message
    """
    from app.agents.tools.cv_tools import create_cv_tools
    
    token = get_bearer_token()
    if not token:
        return "Error: No bearer token available. Cannot update CV."
    
    # Build the updates object with flat structure
    updates = {}
    if full_name is not None:
        updates["fullName"] = full_name
    if email is not None:
        updates["email"] = email
    if phone is not None:
        updates["phone"] = phone
    if address is not None:
        updates["address"] = address
    if summary is not None:
        updates["summary"] = summary
    
    if not updates:
        return "Error: No fields provided to update"
    
    try:
        cv_tools = create_cv_tools(token)
        result = await cv_tools.update_cv(cv_id, updates)
        
        if result.get("success"):
            updated_fields = ", ".join(updates.keys())
            return f"Successfully updated CV: {updated_fields}"
        else:
            return f"Error updating CV: {result.get('error', 'Unknown error')}"
    except Exception as e:
        return f"Error updating CV: {str(e)}"


@tool
async def add_work_experience(
    cv_id: str,
    company: str,
    position: str,
    start_date: str,
    end_date: Optional[str] = None,
    description: Optional[str] = None
) -> str:
    """
    Add a new work experience entry to the CV.
    
    Use this tool when the user wants to add a new job or work experience.
    
    Args:
        cv_id: The CV identifier
        company: Company name (required)
        position: Job position/title (required)
        start_date: Start date (required, format: YYYY-MM-DD or descriptive)
        end_date: End date (optional, format: YYYY-MM-DD or descriptive)
        description: Job description/responsibilities (optional)
        
    Returns:
        Success or error message
    """
    from app.agents.tools.cv_tools import create_cv_tools
    
    token = get_bearer_token()
    if not token:
        return "Error: No bearer token available. Cannot update CV."
    
    experience_data = {
        "company": company,
        "position": position,
        "startDate": start_date
    }
    
    if end_date:
        experience_data["endDate"] = end_date
    if description:
        experience_data["description"] = description
    
    updates = {
        "experience": [experience_data]
    }
    
    try:
        cv_tools = create_cv_tools(token)
        result = await cv_tools.update_cv(cv_id, updates)
        
        if result.get("success"):
            return f"Successfully added work experience: {position} at {company}"
        else:
            return f"Error adding work experience: {result.get('error', 'Unknown error')}"
    except Exception as e:
        return f"Error adding work experience: {str(e)}"


@tool
async def add_skill(
    cv_id: str,
    skill_name: str
) -> str:
    """
    Add a new skill to the CV.
    
    Use this tool when the user wants to add a skill to their CV.
    
    Args:
        cv_id: The CV identifier
        skill_name: Name of the skill
        
    Returns:
        Success or error message
    """
    from app.agents.tools.cv_tools import create_cv_tools
    
    token = get_bearer_token()
    if not token:
        return "Error: No bearer token available. Cannot update CV."
    
    updates = {
        "skills": [skill_name]
    }
    
    try:
        cv_tools = create_cv_tools(token)
        result = await cv_tools.update_cv(cv_id, updates)
        
        if result.get("success"):
            return f"Successfully added skill: {skill_name}"
        else:
            return f"Error adding skill: {result.get('error', 'Unknown error')}"
    except Exception as e:
        return f"Error adding skill: {str(e)}"


# List of all available tools
cv_langchain_tools = [
    get_cv_data,
    update_cv_personal_info,
    add_work_experience,
    add_skill
]
