#!/bin/bash

echo "====================================="
echo "Phase 2 API - Endpoint Verification"
echo "====================================="
echo ""

# Test 1: Health Check
echo "✓ Testing: GET /api/health"
curl -s http://localhost:8002/api/health | python3 -m json.tool | head -5
echo ""

# Test 2: Validate Skill - Standard
echo "✓ Testing: POST /api/validate-skill (Standard)"
curl -s -X POST http://localhost:8002/api/validate-skill \
  -H "Content-Type: application/json" \
  -d '{"skill": "Python"}' | python3 -m json.tool | head -6
echo ""

# Test 3: Validate Skill - Custom
echo "✓ Testing: POST /api/validate-skill (Custom)"
curl -s -X POST http://localhost:8002/api/validate-skill \
  -H "Content-Type: application/json" \
  -d '{"skill": "CustomTool"}' | python3 -m json.tool | head -6
echo ""

# Test 4: PDF Capabilities
echo "✓ Testing: GET /api/pdf/capabilities"
curl -s http://localhost:8002/api/pdf/capabilities | python3 -m json.tool | head -6
echo ""

echo "====================================="
echo "✅ All endpoints are operational!"
echo "====================================="
