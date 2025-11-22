#!/usr/bin/env python3
"""
Debug script to test the skill validation flow end-to-end
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8002"

def test_endpoint(endpoint, method="GET", data=None, description=""):
    """Test an endpoint and print results"""
    print(f"\n{'='*60}")
    print(f"🧪 TEST: {description}")
    print(f"{'='*60}")
    
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
        else:
            response = requests.post(
                f"{BASE_URL}{endpoint}",
                json=data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
        
        print(f"✅ Status Code: {response.status_code}")
        print(f"📝 Response:")
        try:
            json_data = response.json()
            print(json.dumps(json_data, indent=2))
            return json_data
        except:
            print(response.text)
            return None
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def main():
    print("\n🚀 Starting Skill Validation Flow Debug")
    
    # Test 1: Health check
    print("\n" + "="*60)
    print("STEP 1: Health Check")
    print("="*60)
    result = test_endpoint("/api/health", description="Check API health")
    if not result or not result.get("success"):
        print("❌ API is not healthy!")
        sys.exit(1)
    
    # Test 2: Validate standard skill
    print("\n" + "="*60)
    print("STEP 2: Validate Standard Skill")
    print("="*60)
    result = test_endpoint(
        "/api/validate-skill",
        method="POST",
        data={"skill": "Python"},
        description="Validate standard skill 'Python'"
    )
    if result and result.get("success"):
        print("✅ Standard skill validation works!")
    else:
        print("❌ Standard skill validation failed!")
    
    # Test 3: Validate custom skill
    print("\n" + "="*60)
    print("STEP 3: Validate Custom Skill")
    print("="*60)
    result = test_endpoint(
        "/api/validate-skill",
        method="POST",
        data={"skill": "MyCustomFramework"},
        description="Validate custom skill 'MyCustomFramework'"
    )
    if result and result.get("success"):
        print("✅ Custom skill validation works!")
    else:
        print("❌ Custom skill validation failed!")
    
    # Test 4: Validate misspelled skill (should be corrected)
    print("\n" + "="*60)
    print("STEP 4: Validate Misspelled Skill")
    print("="*60)
    result = test_endpoint(
        "/api/validate-skill",
        method="POST",
        data={"skill": "Pyton"},  # Misspelled
        description="Validate misspelled skill 'Pyton'"
    )
    if result and result.get("success"):
        print("✅ Misspelled skill validation works!")
        if result.get("skill") != "Pyton":
            print(f"✨ Skill was corrected: 'Pyton' → '{result.get('skill')}'")
    else:
        print("❌ Misspelled skill validation failed!")
    
    # Test 5: Suggest skills
    print("\n" + "="*60)
    print("STEP 5: Suggest Skills")
    print("="*60)
    cv_data = {
        "experience": [
            {
                "position": "Senior Python Developer",
                "company": "TechCorp",
                "description": "Built REST APIs and microservices with Django and FastAPI"
            }
        ],
        "projects": [
            {
                "name": "Data Pipeline",
                "technologies": ["Python", "Apache Airflow", "PostgreSQL"],
                "description": "ETL pipeline for data processing"
            }
        ],
        "skills": ["Python", "Django", "PostgreSQL"]
    }
    result = test_endpoint(
        "/api/suggest-skills",
        method="POST",
        data={"cv_data": cv_data},
        description="Suggest skills based on CV data"
    )
    if result and result.get("success"):
        print(f"✅ Skill suggestion works! Got {result.get('count')} suggestions")
        print(f"📋 Suggested skills: {', '.join(result.get('suggested_skills', [])[:5])}...")
    else:
        print("❌ Skill suggestion failed!")
    
    print("\n" + "="*60)
    print("✅ Debug test complete!")
    print("="*60)

if __name__ == "__main__":
    main()
