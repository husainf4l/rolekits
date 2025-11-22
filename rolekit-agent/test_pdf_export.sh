#!/bin/bash

echo "=========================================="
echo "PDF Export Feature Test"
echo "=========================================="
echo ""

# Test 1: Check if server is running
echo "✓ Test 1: Checking server..."
if curl -s http://localhost:8002/api/health > /dev/null 2>&1; then
    echo "✅ Server is running on port 8002"
else
    echo "❌ Server is not responding"
    exit 1
fi
echo ""

# Test 2: Test PDF export endpoint
echo "✓ Test 2: Testing PDF export endpoint..."
RESPONSE=$(curl -s -X POST http://localhost:8002/api/export \
  -H "Content-Type: application/json" \
  -d '{
    "cv_data": {
      "contact": {
        "full_name": "Test User",
        "email": "test@example.com",
        "phone": "+1-555-0000",
        "location": "Test City"
      },
      "summary": "Test Summary",
      "experience": [],
      "education": [],
      "projects": [],
      "skills": [],
      "certifications": [],
      "languages": [],
      "awards": [],
      "publications": [],
      "volunteer": []
    },
    "format": "pdf",
    "style": "modern"
  }')

SUCCESS=$(echo "$RESPONSE" | grep -o '"success":true' | head -1)
if [ -n "$SUCCESS" ]; then
    echo "✅ Export endpoint working"
    FILE_ID=$(echo "$RESPONSE" | grep -o '"file_id":"[^"]*' | cut -d'"' -f4)
    echo "   File ID: $FILE_ID"
else
    echo "❌ Export endpoint failed"
    echo "   Response: $RESPONSE"
    exit 1
fi
echo ""

# Test 3: Test PDF download
echo "✓ Test 3: Testing PDF download..."
if curl -s "http://localhost:8002/api/download/$FILE_ID" | file - | grep -q "PDF"; then
    echo "✅ PDF generated successfully"
else
    echo "❌ PDF download failed"
    exit 1
fi
echo ""

echo "=========================================="
echo "✅ All tests passed!"
echo "=========================================="
echo ""
echo "PDF Export is ready to use!"
echo "Click 'Export PDF' button in your resume builder to download."
