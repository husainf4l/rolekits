# Phase 2 API - Complete Endpoint Reference

## Overview

This document provides comprehensive documentation for all Phase 2 API endpoints, including the newly added **Validate Skill** feature and **Suggest Skills** enhancement.

---

## Table of Contents

1. [Health Check Endpoints](#health-check-endpoints)
2. [CV Processing Endpoints](#cv-processing-endpoints)
3. [Skill Management Endpoints](#skill-management-endpoints)
4. [PDF Generation Endpoints](#pdf-generation-endpoints)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## Health Check Endpoints

### GET /api/health

**Purpose:** Verify the API is running and get general service information.

**Response:**
```json
{
  "status": "healthy",
  "service": "CV Processing Pipeline",
  "version": "2.0",
  "endpoints": {
    "extract": "/api/extract",
    "enhance": "/api/enhance",
    "build": "/api/build",
    "export": "/api/export",
    "feedback": "/api/feedback"
  }
}
```

**Status Code:** 200 OK

**Usage:**
```bash
curl http://localhost:8002/api/health
```

---

## Skill Management Endpoints

### POST /api/validate-skill

**NEW ENDPOINT** - Validate if a skill is recognized/standard.

**Purpose:** Determine whether a given skill is a standard/recognized skill or a custom one. This is useful for:
- Validating user input when adding skills to CV
- Categorizing skills as standard or custom
- Providing feedback on skill relevance
- Filtering skills in job matching

**Request Body:**
```json
{
  "skill": "Python"
}
```

**Parameters:**
- `skill` (string, required): The skill to validate (e.g., "Python", "React", "Docker", "Leadership")

**Response (Standard Skill):**
```json
{
  "success": true,
  "skill": "Python",
  "is_standard": true,
  "status": "Valid standard skill",
  "message": "Skill 'Python' is recognized as a standard skill"
}
```

**Response (Custom Skill):**
```json
{
  "success": true,
  "skill": "Custom Framework XYZ",
  "is_standard": false,
  "status": "Custom skill (not standard but acceptable)",
  "message": "Skill 'Custom Framework XYZ' is recognized as a custom skill"
}
```

**Response (Error):**
```json
{
  "detail": "Skill validation failed: Skill parameter is required"
}
```

**Status Codes:**
- 200 OK: Validation successful
- 400 Bad Request: Invalid input (missing skill parameter)
- 500 Internal Server Error: Server error

**Usage Examples:**

```bash
# Valid standard skill
curl -X POST http://localhost:8002/api/validate-skill \
  -H "Content-Type: application/json" \
  -d '{"skill": "Python"}'

# Custom skill
curl -X POST http://localhost:8002/api/validate-skill \
  -H "Content-Type: application/json" \
  -d '{"skill": "Custom Framework XYZ"}'

# With React.js
curl -X POST http://localhost:8002/api/validate-skill \
  -H "Content-Type: application/json" \
  -d '{"skill": "React"}'
```

**Standard Skills Recognized:**

The endpoint recognizes 200+ standard skills across multiple categories:

**Programming Languages:**
Python, JavaScript, Java, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, TypeScript, etc.

**Web Technologies:**
HTML, CSS, XML, JSON, SQL, React, Angular, Vue, Next.js, Django, Flask, FastAPI, etc.

**DevOps & Cloud:**
Docker, Kubernetes, AWS, Azure, GCP, Terraform, Ansible, Jenkins, GitLab CI, GitHub Actions, etc.

**Data Science & AI:**
Machine Learning, Deep Learning, NLP, Computer Vision, PyTorch, TensorFlow, Pandas, NumPy, etc.

**Soft Skills:**
Leadership, Communication, Problem-Solving, Teamwork, Adaptability, Critical Thinking, etc.

**Database:**
MongoDB, PostgreSQL, MySQL, Redis, Cassandra, Elasticsearch, Firebase, etc.

---

### POST /api/suggest-skills

**Purpose:** Generate skill suggestions based on CV content and job description.

**Request Body:**
```json
{
  "cv_text": "Experience: Developed Python applications, worked with databases, created APIs",
  "job_description": "Required: Python, JavaScript, REST APIs, Docker"
}
```

**Parameters:**
- `cv_text` (string, required): The CV content or work experience
- `job_description` (string, required): The target job description

**Response:**
```json
{
  "success": true,
  "suggested_skills": [
    {
      "skill": "JavaScript",
      "category": "Programming Language",
      "relevance": "High",
      "reason": "Requested in job and complements your Python experience"
    },
    {
      "skill": "Docker",
      "category": "DevOps",
      "relevance": "High",
      "reason": "Explicitly mentioned in job description"
    }
  ],
  "count": 2,
  "message": "Successfully generated 2 skill suggestions based on your experience"
}
```

**Response (No New Skills):**
```json
{
  "success": true,
  "suggested_skills": [],
  "count": 0,
  "message": "No new skills to suggest. Your CV already includes relevant skills!"
}
```

**Status Codes:**
- 200 OK: Suggestions generated successfully
- 400 Bad Request: Missing required parameters
- 500 Internal Server Error: Server error

**Usage:**
```bash
curl -X POST http://localhost:8002/api/suggest-skills \
  -H "Content-Type: application/json" \
  -d '{
    "cv_text": "Experienced Python developer with 5 years working with Django and PostgreSQL",
    "job_description": "Looking for: Python, JavaScript, React, Docker, AWS"
  }'
```

---

## PDF Generation Endpoints

### GET /api/pdf/capabilities

**Purpose:** Check available PDF generation capabilities and installation instructions.

**Response:**
```json
{
  "success": true,
  "pdf_generation": {
    "available": true,
    "methods": ["pdfkit", "weasyprint"]
  },
  "message": "PDF generation is available",
  "installation_help": {
    "pdfkit": {
      "pip": "pip install pdfkit",
      "system": "apt-get install wkhtmltopdf"
    },
    "weasyprint": {
      "pip": "pip install weasyprint",
      "system": "No system dependencies required"
    }
  }
}
```

**Status Code:** 200 OK

**Usage:**
```bash
curl http://localhost:8002/api/pdf/capabilities
```

---

## CV Processing Endpoints

### POST /api/extract

**Purpose:** Extract structured information from a CV document.

**Request Parameters:**
- `file` (multipart/form-data): CV document (PDF, DOCX, TXT)

**Response:**
```json
{
  "success": true,
  "cv_id": "uuid-here",
  "extracted_data": {
    "personal_info": {...},
    "education": [...],
    "experience": [...],
    "skills": [...]
  },
  "confidence_score": 0.85
}
```

---

### POST /api/enhance

**Purpose:** Enhance a CV with AI-powered improvements.

**Request Body:**
```json
{
  "cv_id": "uuid",
  "enhancement_type": "all"
}
```

**Response:**
```json
{
  "success": true,
  "enhancements": {
    "summary": "Improved summary section",
    "skills": ["Added relevant keywords"],
    "experience": "Enhanced bullet points"
  }
}
```

---

### POST /api/build

**Purpose:** Build a complete CV from structured data.

**Request Body:**
```json
{
  "personal_info": {...},
  "education": [...],
  "experience": [...],
  "skills": [...]
}
```

**Response:**
```json
{
  "success": true,
  "cv_id": "uuid",
  "html_content": "<html>...</html>"
}
```

---

### POST /api/export

**Purpose:** Export a CV to various formats (PDF, DOCX, etc.).

**Request Body:**
```json
{
  "cv_id": "uuid",
  "format": "pdf"
}
```

**Response:**
```json
{
  "success": true,
  "file_path": "/exports/cv_uuid.pdf",
  "file_size": 245000,
  "format": "pdf"
}
```

---

## Error Handling

All endpoints follow consistent error handling:

**400 Bad Request:**
```json
{
  "detail": "Invalid request: missing required parameter 'skill'"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Skill validation failed: internal server error"
}
```

---

## Examples

### Example 1: Validate Multiple Skills

```python
import requests

skills_to_check = ["Python", "React", "Custom Framework", "Leadership"]
endpoint = "http://localhost:8002/api/validate-skill"

for skill in skills_to_check:
    response = requests.post(endpoint, json={"skill": skill})
    result = response.json()
    print(f"{skill}: {'Standard' if result['is_standard'] else 'Custom'}")
```

**Output:**
```
Python: Standard
React: Standard
Custom Framework: Custom
Leadership: Standard
```

### Example 2: Get Skill Suggestions

```python
import requests

payload = {
    "cv_text": "10 years Python development, Django expert, PostgreSQL specialist",
    "job_description": "Python dev needed with JavaScript, React, Docker, AWS"
}

response = requests.post(
    "http://localhost:8002/api/suggest-skills",
    json=payload
)

suggestions = response.json()
for skill_rec in suggestions['suggested_skills']:
    print(f"- {skill_rec['skill']} ({skill_rec['relevance']})")
```

### Example 3: Complete Workflow

```python
import requests
import json

BASE_URL = "http://localhost:8002/api"

# 1. Check server health
health = requests.get(f"{BASE_URL}/health").json()
print(f"Server Status: {health['status']}")

# 2. Check PDF capabilities
pdf_caps = requests.get(f"{BASE_URL}/pdf/capabilities").json()
print(f"PDF Available: {pdf_caps['pdf_generation']['available']}")

# 3. Validate skills from CV
skills = ["Python", "Django", "Docker", "Leadership", "MyCustomTool"]
for skill in skills:
    result = requests.post(f"{BASE_URL}/validate-skill", json={"skill": skill}).json()
    print(f"- {skill}: {result['status']}")

# 4. Get suggestions for improvement
suggestions = requests.post(
    f"{BASE_URL}/suggest-skills",
    json={
        "cv_text": "Python developer with 5 years experience",
        "job_description": "Python, JavaScript, React, Docker required"
    }
).json()

print(f"Suggested Skills: {len(suggestions['suggested_skills'])} new skills")
```

---

## Testing

Run the comprehensive test suite:

```bash
python test_validate_skill.py
```

This will test:
- ✓ Server health check
- ✓ PDF capabilities
- ✓ Validate-skill with standard skills
- ✓ Validate-skill with custom skills
- ✓ Validate-skill error handling
- ✓ Suggest-skills functionality

---

## Performance Considerations

- **Validate-skill:** ~1-5ms (simple lookup)
- **Suggest-skills:** ~500-2000ms (LLM-based, depends on CV/JD length)
- **Health check:** <1ms
- **PDF capabilities:** <1ms

---

## Notes

- The validate-skill endpoint uses case-insensitive matching
- Custom skills are still valid and accepted
- Skill suggestions require both CV text and job description
- All endpoints support CORS headers for web integration

---

*Last Updated: Phase 2 API v2.0*
