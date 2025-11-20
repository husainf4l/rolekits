# CV Tools Documentation

This module provides tools for interacting with the backend GraphQL API to manage CV data.

## Features

- ✅ **Fetch CV Data**: Retrieve complete CV information
- ✅ **Update CV**: Modify CV data via GraphQL mutations
- ✅ **Format for LLM**: Convert CV data into readable context for the AI agent
- ✅ **Error Handling**: Comprehensive error handling for API calls

## Environment Variables

Add these to your `.env` file:

```env
BACKEND_URL=http://localhost:4003/graphql
BACKEND_API_KEY=rk_c97cf8f6ea0a8d2ba0a09a8bf45b0f6e1dcd9a0b76be633d185aa3d5a2ee5061
```

## API Endpoints

### 1. Get CV
```bash
GET /cv/{cv_id}
```

Example:
```bash
curl http://localhost:8002/cv/123
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "123",
    "personalInfo": {
      "fullName": "John Doe",
      "email": "john@example.com",
      ...
    },
    "experiences": [...],
    "education": [...],
    "skills": [...]
  }
}
```

### 2. Update CV
```bash
POST /cv/update
```

Example:
```bash
curl -X POST http://localhost:8002/cv/update \
  -H "Content-Type: application/json" \
  -d '{
    "cv_id": "123",
    "updates": {
      "personalInfo": {
        "fullName": "Jane Doe",
        "title": "Senior Software Engineer"
      }
    }
  }'
```

Response:
```json
{
  "success": true,
  "data": {...},
  "message": "CV updated successfully"
}
```

### 3. Chat with CV Context
```bash
POST /chat/stream
```

Example:
```bash
curl -X POST http://localhost:8002/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is my current job title?",
    "cv_id": "123"
  }'
```

The agent will automatically load the CV data and answer based on the context.

## Usage in Agent

The agent automatically:
1. Fetches CV data when `cv_id` is provided
2. Formats it as readable context
3. Injects it into the system prompt
4. Uses it to answer questions about the CV

Example queries the agent can handle:
- "What is my current job title?"
- "List my skills"
- "What's my most recent work experience?"
- "Tell me about my education"
- "Suggest improvements to my CV"

## CV Data Structure

```python
{
    "id": "string",
    "personalInfo": {
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "location": "string",
        "title": "string",
        "summary": "string"
    },
    "experiences": [{
        "id": "string",
        "company": "string",
        "position": "string",
        "startDate": "string",
        "endDate": "string",
        "description": "string",
        "current": "boolean"
    }],
    "education": [{
        "id": "string",
        "institution": "string",
        "degree": "string",
        "field": "string",
        "startDate": "string",
        "endDate": "string",
        "description": "string"
    }],
    "skills": [{
        "id": "string",
        "name": "string",
        "level": "string",
        "category": "string"
    }],
    "languages": [{
        "id": "string",
        "name": "string",
        "proficiency": "string"
    }],
    "certifications": [{
        "id": "string",
        "name": "string",
        "issuer": "string",
        "date": "string",
        "url": "string"
    }]
}
```

## Error Handling

All functions return a result object with:
```python
{
    "success": True/False,
    "data": {...},      # On success
    "error": "message", # On failure
    "message": "..."    # Optional status message
}
```

## Future Enhancements

- [ ] Tool calling for automatic CV updates
- [ ] Structured output for CV modifications
- [ ] Version history tracking
- [ ] Batch updates
- [ ] CV validation
- [ ] Export to different formats
