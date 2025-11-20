#!/bin/bash
# Development startup script

echo "🚀 Starting Rolekit Agent..."

# Activate virtual environment
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    python3 -m venv .venv
fi

source .venv/bin/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create .env file with your OpenAI API key"
    echo "Example:"
    echo "OPENAI_API_KEY=sk-..."
    exit 1
fi

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install -q -r requirements.txt

# Run the server
echo "✅ Starting FastAPI server on http://localhost:8002"
echo "📚 API Documentation: http://localhost:8002/docs"
echo "💬 Chat Interface: http://localhost:8002/chat"
echo ""
uvicorn main:app --reload --port 8002
