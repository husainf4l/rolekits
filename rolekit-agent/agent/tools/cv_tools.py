"""
CV Tools for LangGraph agent.
Provides tools to interact with the backend GraphQL API for CV operations.
"""
import os
import httpx
from typing import Dict, Any, Optional
import json


class CVTools:
    """Tools for CV operations via GraphQL API"""
    
    def __init__(self, api_key: str = None):
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:4003/graphql")
        self.api_key = api_key
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for GraphQL requests"""
        headers = {
            "Content-Type": "application/json",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
            headers["x-api-key"] = self.api_key
        return headers
    
    async def get_cv(self, cv_id: str) -> Dict[str, Any]:
        """
        Fetch CV data from the backend.
        
        Args:
            cv_id: The CV identifier
            
        Returns:
            CV data as a dictionary
        """
        query = """
        query GetCV($cvId: String!) {
            cv(cvId: $cvId) {
                id
                fullName
                email
                phone
                address
                summary
                github
                linkedin
                website
                skills
                experience {
                    company
                    position
                    startDate
                    endDate
                    description
                }
                education {
                    institution
                    degree
                    field
                    startDate
                    endDate
                    description
                }
                languages {
                    language
                    proficiency
                }
                certifications {
                    name
                    issuer
                    date
                    url
                }
                projects {
                    name
                    description
                    url
                }
            }
        }
        """
        
        variables = {"cvId": cv_id}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.backend_url,
                    json={"query": query, "variables": variables},
                    headers=self._get_headers(),
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()
                
                if "errors" in result:
                    return {
                        "success": False,
                        "error": result["errors"][0]["message"]
                    }
                
                return {
                    "success": True,
                    "data": result.get("data", {}).get("cv")
                }
                
            except httpx.HTTPError as e:
                return {
                    "success": False,
                    "error": f"HTTP error occurred: {str(e)}"
                }
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Error fetching CV: {str(e)}"
                }
    
    async def update_cv(self, cv_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update CV data via GraphQL mutation.
        
        Args:
            cv_id: The CV identifier
            updates: Dictionary containing the fields to update (flat structure matching UpdateCVInput)
            
        Returns:
            Result of the update operation
        """
        mutation = """
        mutation UpdateCV($cvId: String!, $input: UpdateCVInput!) {
            updateCV(cvId: $cvId, input: $input) {
                id
                fullName
                email
                phone
                address
                summary
            }
        }
        """
        
        variables = {
            "cvId": cv_id,
            "input": updates
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.backend_url,
                    json={"query": mutation, "variables": variables},
                    headers=self._get_headers(),
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()
                
                if "errors" in result:
                    return {
                        "success": False,
                        "error": result["errors"][0]["message"]
                    }
                
                return {
                    "success": True,
                    "data": result.get("data", {}).get("updateCV"),
                    "message": "CV updated successfully"
                }
                
            except httpx.HTTPError as e:
                return {
                    "success": False,
                    "error": f"HTTP error occurred: {str(e)}"
                }
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Error updating CV: {str(e)}"
                }
    
    def format_cv_for_context(self, cv_data: Dict[str, Any]) -> str:
        """
        Format CV data as a readable string for LLM context.
        
        Args:
            cv_data: CV data dictionary (flat structure)
            
        Returns:
            Formatted CV string
        """
        if not cv_data or not isinstance(cv_data, dict):
            return "No CV data available"
        
        sections = []
        
        # Personal Info
        sections.append("=== PERSONAL INFORMATION ===")
        if cv_data.get("fullName"):
            sections.append(f"Name: {cv_data['fullName']}")
        if cv_data.get("email"):
            sections.append(f"Email: {cv_data['email']}")
        if cv_data.get("phone"):
            sections.append(f"Phone: {cv_data['phone']}")
        if cv_data.get("address"):
            sections.append(f"Address: {cv_data['address']}")
        if cv_data.get("summary"):
            sections.append(f"Summary: {cv_data['summary']}")
        if cv_data.get("linkedin"):
            sections.append(f"LinkedIn: {cv_data['linkedin']}")
        if cv_data.get("github"):
            sections.append(f"GitHub: {cv_data['github']}")
        if cv_data.get("website"):
            sections.append(f"Website: {cv_data['website']}")
        sections.append("")
        
        # Experience
        if experience := cv_data.get("experience"):
            sections.append("=== WORK EXPERIENCE ===")
            for exp in experience:
                sections.append(f"• {exp.get('position')} at {exp.get('company')}")
                if exp.get("startDate"):
                    date_range = f"{exp['startDate']} - {exp.get('endDate', 'Present')}"
                    sections.append(f"  {date_range}")
                if exp.get("description"):
                    sections.append(f"  {exp['description']}")
                sections.append("")
        
        # Education
        if education := cv_data.get("education"):
            sections.append("=== EDUCATION ===")
            for edu in education:
                sections.append(f"• {edu.get('degree')} in {edu.get('field')}")
                sections.append(f"  {edu.get('institution')}")
                if edu.get("startDate"):
                    sections.append(f"  {edu['startDate']} - {edu.get('endDate', 'Present')}")
                if edu.get("description"):
                    sections.append(f"  {edu['description']}")
                sections.append("")
        
        # Skills
        if skills := cv_data.get("skills"):
            sections.append("=== SKILLS ===")
            if isinstance(skills, list):
                if skills and isinstance(skills[0], str):
                    # Skills are just strings
                    sections.append(", ".join(skills))
                else:
                    # Skills might be objects
                    skill_text = ", ".join([str(s) for s in skills])
                    sections.append(skill_text)
            sections.append("")
        
        # Languages
        if languages := cv_data.get("languages"):
            sections.append("=== LANGUAGES ===")
            for lang in languages:
                sections.append(f"• {lang.get('language')} - {lang.get('proficiency', 'N/A')}")
            sections.append("")
        
        # Certifications
        if certifications := cv_data.get("certifications"):
            sections.append("=== CERTIFICATIONS ===")
            for cert in certifications:
                sections.append(f"• {cert.get('name')} - {cert.get('issuer')}")
                if cert.get("date"):
                    sections.append(f"  Date: {cert['date']}")
                if cert.get("url"):
                    sections.append(f"  URL: {cert['url']}")
                sections.append("")
        
        # Projects
        if projects := cv_data.get("projects"):
            sections.append("=== PROJECTS ===")
            for proj in projects:
                sections.append(f"• {proj.get('name')}")
                if proj.get("description"):
                    sections.append(f"  {proj['description']}")
                if proj.get("url"):
                    sections.append(f"  URL: {proj['url']}")
                sections.append("")
        
        return "\n".join(sections)


# Function to create CVTools instance with token
def create_cv_tools(bearer_token: str) -> CVTools:
    """
    Create a CVTools instance with a bearer token.
    
    Args:
        bearer_token: The bearer token for API authentication
        
    Returns:
        CVTools instance
    """
    return CVTools(api_key=bearer_token)
