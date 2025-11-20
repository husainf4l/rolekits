# 📁 Project Structure & Organization Guide

## Directory Overview

```
rolekit-agent/
├── 📄 Core Files
│   ├── main.py                  # FastAPI application entry point
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Environment variables (local)
│   ├── .env.example              # Environment template
│   ├── docker-compose.yml        # Docker orchestration
│   ├── start.sh                  # Quick start script
│   └── README.md                 # Main documentation
│
├── 📦 app/                       # Main application package
│   ├── __init__.py
│   │
│   ├── 🤖 agents/                # LangGraph agent system
│   │   ├── __init__.py
│   │   ├── agent.py              # Main agent with streaming
│   │   ├── nodes/                # Agent processing nodes
│   │   │   ├── __init__.py
│   │   │   └── streaming_node.py # Streaming response node
│   │   └── tools/                # Agent capabilities
│   │       ├── __init__.py
│   │       ├── cv_tools.py       # CV-specific tools
│   │       └── langchain_tools.py # LangChain integration
│   │
│   ├── 🌐 api/                   # FastAPI routes
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── cv_routes.py      # CV extraction & processing
│   │       └── phase2_routes.py  # Resume building & export
│   │
│   ├── ⚙️ core/                  # Configuration & dependencies
│   │   ├── __init__.py
│   │   ├── config.py             # Settings management
│   │   └── dependencies.py       # FastAPI dependencies
│   │
│   ├── 📋 models/                # Pydantic data models
│   │   ├── __init__.py
│   │   └── cv_models.py          # CV data structures
│   │
│   ├── 💼 services/              # Business logic layer
│   │   ├── __init__.py
│   │   ├── pdf_generator.py      # PDF export using WeasyPrint
│   │   ├── cv/                   # CV-specific services
│   │   │   ├── __init__.py
│   │   │   ├── cv_builder.py     # Build HTML/PDF resumes
│   │   │   ├── job_matcher.py    # Job description matching
│   │   │   ├── profile_enhancer.py # AI enhancement
│   │   │   ├── schema_extractor.py # Extract CV data
│   │   │   └── __pycache__/
│   │   ├── parser/               # Document parsing
│   │   │   ├── __init__.py
│   │   │   ├── document_parser.py # Parse PDF/DOCX/TXT
│   │   │   └── __pycache__/
│   │   └── __pycache__/
│   │
│   ├── 🎨 static/                # Frontend assets (MODERN UI)
│   │   ├── index.html            # Main HTML page
│   │   ├── app.js                # Application logic (~1000 lines)
│   │   └── styles.css            # Professional styling (~800 lines)
│   │
│   ├── 📝 templates/             # Backend HTML templates (if needed)
│   │   ├── cv_templates/         # Resume templates
│   │   └── ...
│   │
│   └── __pycache__/
│
├── 🧪 tests/                     # Test suite
│   ├── __init__.py
│   ├── unit/                     # Unit tests
│   │   ├── __init__.py
│   │   ├── test_agent_llm.py
│   │   ├── test_cv_tools.py
│   │   ├── test_graphql.py
│   │   └── __pycache__/
│   └── integration/              # Integration tests
│       └── __init__.py
│
├── 📂 exports/                   # Generated files (temporary)
│   └── [Generated PDFs and HTML previews]
│
├── 🐳 .github/
│   ├── workflows/
│   └── ...
│
├── 🔒 .venv/                     # Python virtual environment
│
├── 🚫 .gitignore                 # Git ignore rules
│
└── 📊 __pycache__/               # Python cache
```

## File Organization Strategy

### ✅ Kept Files (Production)
```
Essential Files:
├── main.py                      # Entry point
├── requirements.txt             # Dependencies
├── .env & .env.example         # Configuration
├── README.md                    # Documentation
├── docker-compose.yml           # Orchestration
└── app/                         # Application code
    ├── agents/
    ├── api/
    ├── core/
    ├── models/
    ├── services/
    ├── static/                  # Modern UI (clean)
    └── templates/
```

### 🗑️ Removed Files (Cleanup)

**Documentation (Outdated/Redundant)**
- PHASE2_API.md
- PHASE2_COMPLETE.md
- PDF_GENERATION.md
- NEW_UI_DESIGN.md
- QUICK_REFERENCE.md
- RESTRUCTURING.md
- LLM_VERIFICATION_REPORT.md
- QUICK_IMPLEMENTATION_GUIDE.md
- RESUME_BUILDER_DEVELOPMENT_PLAN.md
- README_CV_SYSTEM.md
- UI_READY.md
- SUMMARY.md
- MODERN_UI_GUIDE.md
- FILES_CREATED_SUMMARY.md
- INTERFACE_GUIDE.md
- MODERN_REDESIGN_COMPLETE.md

**Frontend (Old UI)**
- static/app.js (old version)
- static/index.html (old version)
- static/template-carousel-test.html (test file)
- static/sample_cv.txt

**Backend/Configuration**
- graphql_schema.json
- verify_structure.py

**Test Files**
- examples_pdf_generation.py
- test_phase2_api.py
- test_cv.pdf
- example_*.pdf

**Generated Files**
- exports/* (all preview HTML and PDFs)

### 📦 Frontend Assets (Renamed & Organized)

```
static/
├── index.html          (was: index-modern.html)
├── app.js              (was: app-modern.js, 1000+ lines)
└── styles.css          (was: styles-modern.css, 800+ lines)

No external dependencies - Pure vanilla JavaScript + CSS3
```

## Backend Architecture

### API Routes Structure
```
app/api/routes/
├── cv_routes.py              # POST /api/extract, /api/enhance, GET /api/templates
└── phase2_routes.py          # POST /api/build, /api/export
```

### Services Layer
```
app/services/
├── cv/
│   ├── cv_builder.py         # Build HTML/PDF resumes
│   ├── schema_extractor.py   # Extract data using LLM
│   ├── profile_enhancer.py   # AI enhancement
│   └── job_matcher.py        # Job matching
├── parser/
│   └── document_parser.py    # Parse PDF, DOCX, TXT
└── pdf_generator.py          # PDF export
```

### Models
```
app/models/
└── cv_models.py              # Pydantic schemas
```

## Frontend Architecture

### State Management
```javascript
class ResumeBuilderApp {
  state = {
    selectedTemplate: 'modern',
    resumeData: {},
    currentView: 'dashboard',
    isLoading: false,
    error: null
  }
}
```

### Views
1. **Dashboard** - Hero + Features + Template Carousel
2. **Editor** - Split Panel (Form + Live Preview)
3. **Templates** - Gallery View

### Key Methods
- `renderDashboard()` - Home view
- `renderEditor()` - Edit view
- `renderTemplates()` - Templates view
- `handleAction()` - Central event router
- `setState()` - State management
- `renderTemplateCarousel()` - 6 templates

### Templates Available
1. **Modern** - Blue gradient (#007AFF)
2. **Classic** - Dark gray (#333333)
3. **Creative** - Red gradient (#FF6B6B)
4. **Minimal** - Gray gradient (#666666)
5. **Bold** - Orange gradient (#FF9500)
6. **Elegant** - Purple gradient (#9C27B0)

## Configuration Management

### Environment Variables (.env)
```env
# Required
OPENAI_API_KEY=sk-...

# Optional
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
HOST=0.0.0.0
PORT=8002
```

### Application Settings (app/core/config.py)
- API keys
- Model selection
- Temperature settings
- Feature flags

## Testing Structure

### Unit Tests (tests/unit/)
- `test_agent_llm.py` - Agent logic
- `test_cv_tools.py` - CV tools
- `test_graphql.py` - GraphQL integration

### Integration Tests (tests/integration/)
- End-to-end API tests
- Service integration tests

## Development Workflow

### Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Development
```bash
uvicorn main:app --reload --port 8002
```

### Testing
```bash
pytest tests/ -v
pytest tests/ --cov=app
```

### Docker
```bash
docker-compose up
```

## Code Quality Guidelines

### Backend (Python)
- Pydantic for validation
- Type hints throughout
- Dependency injection
- Service layer pattern
- Error handling

### Frontend (JavaScript)
- ES6+ features
- Class-based architecture
- Event delegation
- Vanilla JS (no dependencies)
- Responsive CSS

## Deployment

### Development
- Local: `python main.py`
- Docker: `docker-compose up`

### Production
```bash
uvicorn main:app --host 0.0.0.0 --port 8002 --workers 4
```

## File Size Reference

| Component | Size | Purpose |
|-----------|------|---------|
| app.js | 22 KB | Frontend logic |
| styles.css | 23 KB | Styling system |
| index.html | 369 bytes | HTML shell |
| Total Frontend | 45 KB | Complete UI |

---

**Organization Completed**: ✅  
**Last Updated**: November 2024  
**Status**: Production Ready
