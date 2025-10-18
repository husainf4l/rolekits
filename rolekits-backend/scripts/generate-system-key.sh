#!/bin/bash

# Generate System API Key Script
# This script calls the GraphQL mutation to create a new system API key

echo "═══════════════════════════════════════════════════════════"
echo "🔑 Generating System API Key"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Default secret (change this in production by setting SYSTEM_SECRET env var)
SECRET="${SYSTEM_SECRET:-changeme123}"
GRAPHQL_URL="http://localhost:4003/graphql"

# Make the GraphQL request
RESPONSE=$(curl -s -X POST "$GRAPHQL_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation { generateSystemApiKey(secretCode: \\\"$SECRET\\\") }\"}")

# Extract the key from the response
API_KEY=$(echo "$RESPONSE" | grep -o '"generateSystemApiKey":"[^"]*"' | cut -d'"' -f4)

if [ -n "$API_KEY" ]; then
  echo "✅ System API Key Generated Successfully!"
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "🔐 YOUR SYSTEM API KEY"
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  echo "$API_KEY"
  echo ""
  echo "⚠️  SAVE THIS KEY SECURELY - IT CANNOT BE RETRIEVED AGAIN!"
  echo ""
  echo "Use it in Authorization header:"
  echo "Authorization: Bearer $API_KEY"
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  
  # Optionally save to .env.system (git-ignored)
  echo "SYSTEM_API_KEY=$API_KEY" > .env.system
  echo "💾 Key also saved to .env.system (git-ignored)"
  echo ""
else
  echo "❌ Failed to generate API key"
  echo ""
  echo "Response:"
  echo "$RESPONSE"
  echo ""
  echo "Make sure:"
  echo "  1. Backend is running on port 4003"
  echo "  2. Secret code is correct (default: changeme123)"
  echo "  3. Check SYSTEM_SECRET environment variable if you changed it"
fi
