#!/usr/bin/env python3
"""
Test script for the validate-skill endpoint and other Phase 2 features
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8002"
ENDPOINTS = {
    "validate_skill": f"{BASE_URL}/api/validate-skill",
    "suggest_skills": f"{BASE_URL}/api/suggest-skills",
    "health": f"{BASE_URL}/api/health",
    "pdf_capabilities": f"{BASE_URL}/api/pdf/capabilities"
}

def print_response(title: str, response: Dict[str, Any], status_code: int = None):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    if status_code:
        print(f"Status Code: {status_code}")
    print(json.dumps(response, indent=2))

def test_validate_skill():
    """Test the validate-skill endpoint with various skills"""
    print("\n\n### TESTING VALIDATE-SKILL ENDPOINT ###")
    
    test_skills = [
        "Python",
        "JavaScript",
        "React",
        "Docker",
        "Machine Learning",
        "Custom Framework XYZ",
        "Leadership",
        "Problem Solving",
        "AI/ML",
        ""  # empty skill to test error handling
    ]
    
    for skill in test_skills:
        if not skill:
            print(f"\n✗ Testing with empty skill (should fail)...")
            try:
                response = requests.post(
                    ENDPOINTS["validate_skill"],
                    json={"skill": skill},
                    timeout=10
                )
                print_response(f"Empty Skill Response", response.json(), response.status_code)
            except Exception as e:
                print(f"Error: {str(e)}")
        else:
            print(f"\n✓ Testing skill: {skill}")
            try:
                response = requests.post(
                    ENDPOINTS["validate_skill"],
                    json={"skill": skill},
                    timeout=10
                )
                data = response.json()
                print_response(f"Validation Result for '{skill}'", data, response.status_code)
            except Exception as e:
                print(f"Error: {str(e)}")

def test_suggest_skills():
    """Test the suggest-skills endpoint"""
    print("\n\n### TESTING SUGGEST-SKILLS ENDPOINT ###")
    
    test_payload = {
        "cv_text": """
        Experience:
        - Developed web applications using Python and Django
        - Worked with SQL databases and PostgreSQL
        - Managed Docker containers and Kubernetes
        - Created RESTful APIs using Flask
        - Collaborated with teams using Git and GitHub
        - Implemented CI/CD pipelines
        """,
        "job_description": """
        Required Skills:
        - Python, JavaScript, React
        - AWS, Docker, Kubernetes
        - Machine Learning basics
        - DevOps experience
        """
    }
    
    print(f"\nPayload: {json.dumps(test_payload, indent=2)}")
    try:
        response = requests.post(
            ENDPOINTS["suggest_skills"],
            json=test_payload,
            timeout=10
        )
        data = response.json()
        print_response("Skill Suggestions", data, response.status_code)
    except Exception as e:
        print(f"Error: {str(e)}")

def test_health():
    """Test the health check endpoint"""
    print("\n\n### TESTING HEALTH CHECK ###")
    try:
        response = requests.get(ENDPOINTS["health"], timeout=10)
        data = response.json()
        print_response("Health Check Response", data, response.status_code)
    except Exception as e:
        print(f"Error: {str(e)}")

def test_pdf_capabilities():
    """Test PDF capabilities endpoint"""
    print("\n\n### TESTING PDF CAPABILITIES ###")
    try:
        response = requests.get(ENDPOINTS["pdf_capabilities"], timeout=10)
        data = response.json()
        print_response("PDF Capabilities", data, response.status_code)
    except Exception as e:
        print(f"Error: {str(e)}")

def main():
    """Run all tests"""
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  Phase 2 API - Comprehensive Test Suite                   ║")
    print("║  Testing validate-skill, suggest-skills, and health       ║")
    print("╚════════════════════════════════════════════════════════════╝")
    
    print(f"\n📡 Connecting to server at: {BASE_URL}")
    
    # Test health first to ensure server is running
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            print("✓ Server is running and healthy!")
        else:
            print(f"⚠ Server responded with status {response.status_code}")
    except Exception as e:
        print(f"✗ Cannot connect to server: {str(e)}")
        print("Make sure the FastAPI server is running with:")
        print("  python -m uvicorn main:app --reload --port 8002")
        return
    
    # Run all tests
    test_health()
    test_pdf_capabilities()
    test_validate_skill()
    test_suggest_skills()
    
    print("\n\n╔════════════════════════════════════════════════════════════╗")
    print("║  ✓ All tests completed!                                    ║")
    print("╚════════════════════════════════════════════════════════════╝\n")

if __name__ == "__main__":
    main()
