#!/bin/bash

echo "=========================================="
echo "Testing Skill Addition Flow"
echo "=========================================="
echo ""

# Test 1: API Endpoint
echo "✓ Test 1: Testing /api/validate-skill endpoint"
echo "---"
echo "Testing with skill: 'Python'"
response=$(curl -s -X POST http://localhost:8002/api/validate-skill \
  -H "Content-Type: application/json" \
  -d '{"skill": "Python"}')

echo "Response:"
echo "$response" | python3 -m json.tool
echo ""

# Test 2: Custom skill
echo "✓ Test 2: Testing with custom skill: 'MyCustomFramework'"
echo "---"
response=$(curl -s -X POST http://localhost:8002/api/validate-skill \
  -H "Content-Type: application/json" \
  -d '{"skill": "MyCustomFramework"}')

echo "Response:"
echo "$response" | python3 -m json.tool
echo ""

# Test 3: Suggest Skills endpoint
echo "✓ Test 3: Testing /api/suggest-skills endpoint"
echo "---"
response=$(curl -s -X POST http://localhost:8002/api/suggest-skills \
  -H "Content-Type: application/json" \
  -d '{
    "cv_data": {
      "experience": [{"position": "Python Developer", "description": "Built REST APIs"}],
      "projects": [{"name": "Project A", "technologies": ["Python", "Django"]}],
      "skills": ["Python", "Django"]
    }
  }')

echo "Response:"
echo "$response" | python3 -m json.tool
echo ""

echo "=========================================="
echo "✅ All tests completed!"
echo "=========================================="
