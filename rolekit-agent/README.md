# 📄 Resume Builder - AI-Powered Resume Creation# Rolekit Agent



A modern, professional web-based resume builder with AI enhancement powered by OpenAI's GPT-4o-mini model.A comprehensive AI-powered CV enhancement and management system built with FastAPI, LangChain, and LangGraph.



## 🎯 Features## 🏗️ Project Structure



✨ **AI-Powered CV Extraction** - Extract data from existing resumes using GPT-4o-mini  ```

🎨 **6 Professional Templates** - Modern, Classic, Creative, Minimal, Bold, Elegant  rolekit-agent/

📊 **Live Preview** - Real-time editing with instant visual feedback  ├── frontend/                    # Vite + React app scaffold (Phase 2 target)

📥 **Multi-Format Support** - Import PDF, DOCX, TXT; Export to PDF, DOCX, HTML  │   └── README.md

🔄 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile  ├── backend/                     # FastAPI service scaffold

💾 **One-Click Export** - Download your resume in multiple formats  │   ├── README.md

│   └── requirements.txt

## 🏗️ Project Structure├── shared/                      # Cross-cutting assets (types, helpers)

│   └── README.md

```├── infra/                       # Infrastructure-as-code + schema

rolekit-agent/│   ├── README.md

├── app/                         # Main application package│   └── database/

│   ├── agents/                  # LangGraph agent nodes and streaming│       └── schema.sql

│   ├── api/                     # FastAPI routes├── app/                         # Existing Rolekit service package

│   │   └── routes/│   ├── agents/

│   │       ├── cv_routes.py     # CV extraction endpoints│   ├── api/

│   │       └── phase2_routes.py # Resume building endpoints│   ├── core/

│   ├── core/                    # Configuration│   ├── models/

│   │   ├── config.py│   ├── services/

│   │   └── dependencies.py│   ├── static/

│   ├── models/                  # Pydantic data models│   └── templates/

│   │   └── cv_models.py├── tests/

│   ├── services/                # Business logic├── docker-compose.yml           # Local orchestration stack

│   │   ├── pdf_generator.py     # PDF export├── .github/workflows/test.yml   # CI for backend/frontend

│   │   ├── cv/                  # CV services├── main.py

│   │   │   ├── cv_builder.py├── requirements.txt

│   │   │   ├── job_matcher.py├── .env

│   │   │   ├── profile_enhancer.py├── .gitignore

│   │   │   └── schema_extractor.py└── README.md

│   │   └── parser/              # Document parsing```

│   │       └── document_parser.py

│   ├── static/                  # Frontend assets## Phase 1 Infrastructure (Quick Implementation Guide)

│   │   ├── index.html          # Main HTML page

│   │   ├── app.js              # Application logic (~1000 lines)- **Environment & Structure**: Added `frontend`, `backend`, `shared`, and `infra` folders plus supporting READMEs to match the guide.

│   │   └── styles.css          # Professional styling (~800 lines)- **Database Schema**: `infra/database/schema.sql` captures the canonical PostgreSQL tables for users, resumes, and templates.

│   ├── nodes/                   # Agent nodes- **Docker & Dev Orchestration**: `docker-compose.yml` wires Postgres, FastAPI backend, Vite frontend, and Redis services; `backend/Dockerfile` and `frontend/Dockerfile` provide build contexts.

│   │   └── streaming_node.py- **CI/CD**: `.github/workflows/test.yml` runs backend pytest + frontend npm scripts on every push/PR.

│   └── tools/                   # Agent tools

│       ├── cv_tools.pyThese deliverables complete Phase 1 of the `QUICK_IMPLEMENTATION_GUIDE.md`. Phase 2 and 3 continue fleshing out the React application and dedicated FastAPI backend.

│       └── langchain_tools.py

├── tests/                       # Test suite## Phase 2 Frontend (Quick Implementation Guide)

│   ├── unit/

│   └── integration/- **Vite + React + TS App**: `frontend/` now hosts a real project scaffolded with Tailwind, React Query, Zustand, React Router, and supportive UI primitives.

├── exports/                     # Generated files (temporary)- **Feature Folders**: Components follow the guide's structure (`components/UI`, `components/Resume`, `pages`, `hooks`, `store`, `services`, `types`, `utils`).

├── main.py                      # FastAPI application entry- **Resume Experience**: `ResumeEditor`, live `Preview`, `TemplateSelector`, and `FormFields` (Contact/Summary/Experience) enable CRUD-ready UI flows.

├── requirements.txt             # Python dependencies- **State & Data**: React Query hooks (`useResume`, `useTemplates`) layer over Axios services, while Zustand stores keep optimistic state in sync.

├── .env                         # Environment variables (local)- **Routing Layout**: Shared header + sidebar layout drives Dashboard, Templates, Editor, Preview, and Settings routes out of the box.

├── .env.example                 # Environment template

├── docker-compose.yml           # Docker compose configurationNext steps include wiring these views to real backend endpoints, adding Vitest coverage, and implementing template previews fed by the FastAPI service.

├── start.sh                     # Quick start script

└── README.md                    # This file## Phase 3 Backend API (Quick Implementation Guide)

```

- **FastAPI Service**: `backend/app` now exposes REST endpoints for resumes, templates, export, and AI helpers with routers that mirror the guide examples.

## 🚀 Quick Start- **SQLAlchemy Models**: `app/models/{user,resume,template}.py` plus `infra/database/schema.sql` stay in sync, and `app/schemas` provides the corresponding Pydantic contracts.

- **Services Layer**: `app/services/export_service.py` (WeasyPrint + DOCX) and `app/services/ai_service.py` (OpenAI) back the export/AI routes.

### Prerequisites- **Dependencies & Config**: `app/core/config.py` centralizes env vars like `DATABASE_URL` and `OPENAI_API_KEY`, while `app/db/session.py` exposes `get_db`.

- Python 3.9+- **Dev Workflow**: `docker-compose.yml` starts Postgres + FastAPI (`uvicorn app.main:app`), and `backend/Dockerfile` builds a production image.

- OpenAI API key- **Auth & JWT**: `/api/v1/auth/signup|login|me` issue HS256 tokens stored in `Authorization: Bearer` headers; `get_current_user` now validates tokens and loads real `User` rows.

- Virtual environment tool- **Migrations & Seeds**: Alembic lives under `backend/alembic/` with an initial migration (`alembic upgrade head`). Templates seed data sits in `app/data/templates.py` and can be loaded via `python -m app.db.seeds`.



### InstallationUse `uvicorn app.main:app --reload --port 8000` from `backend/` for local development or `docker compose up backend db` for a containerized stack.



1. **Clone and navigate:**## 🚀 Features

```bash

cd rolekit-agent### 1. **AI-Powered CV Enhancement**

```- LLM-based content optimization

- Professional phrasing with STAR method

2. **Create virtual environment:**- Impact quantification suggestions

```bash- Tone and clarity improvements

python -m venv .venv

source .venv/bin/activate  # Linux/Mac### 2. **Intelligent Job Matching**

# .venv\Scripts\activate  # Windows- Semantic similarity using embeddings

```- Match scoring (0-100)

- Keyword optimization for job descriptions

3. **Install dependencies:**- ATS (Applicant Tracking System) compatibility checks

```bash

pip install -r requirements.txt### 3. **Multi-Format Document Processing**

```- Parse PDF, DOCX, and TXT files

- Extract structured CV data

4. **Setup environment:**- LLM-powered schema extraction

```bash- Data validation and cleanup

cp .env.example .env

# Edit .env and add your OpenAI API key### 4. **Professional CV Building**

```- Export to HTML, Markdown, and JSON

- Modern, professional templates

5. **Run application:**- Customizable styling

```bash- Print-ready formats

python main.py

# or### 5. **Conversational AI Interface**

./start.sh- Streaming chat responses (SSE)

```- Tool-calling capabilities

- Context-aware conversations

Application available at **`http://localhost:8002`**- CV data integration



## 🎨 Frontend (`static/`)## 📋 Prerequisites



Modern, responsive UI built with vanilla JavaScript (no external dependencies).- Python 3.10+

- OpenAI API key

### Files- (Optional) Backend GraphQL API for CV storage

- **`index.html`** - Application shell and entry point

- **`app.js`** - Complete application logic (~1000 lines)## 🔧 Installation

  - State management system

  - View rendering (Dashboard, Editor, Templates)1. **Clone the repository**

  - Event handling and routing```bash

  - API integrationgit clone https://github.com/husainf4l/rolekits.git

- **`styles.css`** - Professional design system (~800 lines)cd rolekit-agent

  - CSS variables for theming (8 colors)```

  - Responsive breakpoints (mobile, tablet, desktop)

  - Component styles with animations2. **Create virtual environment**

  - Transitions and effects```bash

python -m venv .venv

### Architecturesource .venv/bin/activate  # On Windows: .venv\Scripts\activate

- **State-Based Rendering** - Single source of truth```

- **Event Delegation** - Central `handleAction()` router

- **Template Literals** - Dynamic HTML generation3. **Install dependencies**

- **6 Professional Templates**```bash

  - Modern (Blue) - Contemporary designpip install -r requirements.txt

  - Classic (Dark Gray) - Professional look```

  - Creative (Red) - Bold design

  - Minimal (Gray) - Simple layout4. **Configure environment**

  - Bold (Orange) - Eye-catching```bash

  - Elegant (Purple) - Sophisticatedcp .env.example .env

# Edit .env and add your OpenAI API key

### Key Views```

1. **Dashboard** - Hero section + feature cards + template carousel

2. **Editor** - Split-panel form + live previewExample `.env`:

3. **Templates** - Full gallery of template options```env

OPENAI_API_KEY=sk-...

## 🔧 Backend (`app/`)OPENAI_MODEL=gpt-4o-mini

OPENAI_TEMPERATURE=0.7

FastAPI-powered backend with LangChain integration.OPENAI_EMBEDDING_MODEL=text-embedding-3-small



### API Routes# Optional: Backend API

BACKEND_URL=http://localhost:4003/graphql

**CV Processing** (`POST /api/extract`)```

```bash

curl -X POST http://localhost:8002/api/extract \## 🏃 Running the Application

  -F "file=@resume.pdf"

```### Development Mode

```bash

**Resume Building** (`POST /api/build`)uvicorn main:app --reload --port 8002

```bash```

curl -X POST http://localhost:8002/api/build \

  -H "Content-Type: application/json" \### Production Mode

  -d '{"data": {...}, "template": "modern"}'```bash

```uvicorn main:app --host 0.0.0.0 --port 8002 --workers 4

```

**PDF Export** (`POST /api/export`)

```bash### Access the Application

curl -X POST http://localhost:8002/api/export \- **API Documentation**: http://localhost:8002/docs

  -H "Content-Type: application/json" \- **Chat Interface**: http://localhost:8002/chat

  -d '{"format": "pdf", "data": {...}}'- **API Base URL**: http://localhost:8002/api/v1

```

## 📚 API Endpoints

**AI Enhancement** (`POST /api/enhance`)

```bash### CV Processing (`/api/v1/cv`)

curl -X POST http://localhost:8002/api/enhance \

  -H "Content-Type: application/json" \#### Parse CV from Text

  -d '{"cv_data": {...}, "target_role": "Senior Developer"}'```bash

```POST /api/v1/cv/parse/text

{

**Templates** (`GET /api/templates`)  "text": "John Doe\nSenior Developer...",

```bash  "target_role": "Software Engineer"

curl http://localhost:8002/api/templates}

``````



**Health Check** (`GET /api/health`)#### Upload CV Document

```bash```bash

curl http://localhost:8002/api/healthPOST /api/v1/cv/parse/upload

```Content-Type: multipart/form-data

- file: [PDF/DOCX/TXT file]

### Key Services- target_role: "Data Scientist" (optional)

```

**CV Services** (`app/services/cv/`)

- `cv_builder.py` - Build HTML/PDF resumes#### Enhance CV

- `schema_extractor.py` - Extract CV data using LLM```bash

- `profile_enhancer.py` - AI content enhancementPOST /api/v1/cv/enhance

- `job_matcher.py` - Match CV to job descriptions{

  "cv_data": {...},

**PDF Generation** (`app/services/pdf_generator.py`)  "target_role": "Product Manager",

- WeasyPrint-based PDF export  "enhancement_focus": ["clarity", "impact", "keywords"]

- Custom template rendering}

- Multi-page support```



**Document Parsing** (`app/services/parser/`)#### Match Job Description

- PDF parsing (PyMuPDF)```bash

- DOCX parsing (python-docx)POST /api/v1/cv/match-job

- TXT parsing{

- Data extraction and validation  "cv_data": {...},

  "job_description": "We are looking for..."

## 📋 Environment Variables}

```

```env

# OpenAI Configuration#### Check ATS Compatibility

OPENAI_API_KEY=sk-your-key-here```bash

OPENAI_MODEL=gpt-4o-miniPOST /api/v1/cv/check-ats

OPENAI_TEMPERATURE=0.7{

  "cv_data": {...}

# Server Configuration}

HOST=0.0.0.0```

PORT=8002

#### Build CV Export

# Optional Database```bash

DATABASE_URL=postgresql://user:pass@localhost/dbnamePOST /api/v1/cv/build

```{

  "cv_data": {...},

## 📦 Dependencies  "format": "html",  # or "markdown", "json"

  "style": "modern"

### Backend}

- **FastAPI** - Modern web framework```

- **Pydantic** - Data validation

- **LangChain** - LLM orchestration### Chat Endpoints

- **PyMuPDF** - PDF parsing

- **python-docx** - DOCX parsing#### Stream Chat Response

- **WeasyPrint** - PDF generation```bash

- **Uvicorn** - ASGI serverPOST /chat/stream

{

### Frontend  "query": "Help me improve my CV",

- **Vanilla JavaScript** - ES6+ (no dependencies)  "conversation_id": "conv-123",

- **CSS3** - Grid, Flexbox, Variables  "cv_id": "cv-456",

  "bearer_token": "token-xyz"

## 🧪 Testing}

```

Run unit tests:

```bash## 🧪 Testing

pytest tests/unit/ -v

``````bash

# Run unit tests

Run integration tests:pytest tests/unit/ -v

```bash

pytest tests/integration/ -v# Run integration tests

```pytest tests/integration/ -v



Run with coverage:# Run all tests with coverage

```bashpytest --cov=app tests/

pytest --cov=app tests/```

```

## 🏗️ Architecture

## 🐳 Docker

### Technology Stack

Build and run with Docker Compose:- **Framework**: FastAPI 0.120+

```bash- **AI/ML**: LangChain, LangGraph, OpenAI GPT-4

docker-compose up- **Document Processing**: PyMuPDF, python-docx

```- **Templating**: Jinja2

- **Embeddings**: OpenAI text-embedding-3-small

Or run individual services:

```bash### Design Patterns

# Backend only- **Dependency Injection**: FastAPI dependencies

docker-compose up backend- **Service Layer**: Separation of business logic

- **Repository Pattern**: Data access abstraction

# With database- **Agent-based Architecture**: LangGraph state machines

docker-compose up backend db- **Tool Pattern**: Modular agent capabilities

```

### Key Components

## 💻 Development

1. **LangGraph Agent** (`app/agents/agent.py`)

### Run with Auto-Reload   - State management

```bash   - Tool execution

uvicorn main:app --reload --port 8002   - Streaming responses

```

2. **CV Services** (`app/services/cv/`)

### Access API Documentation   - Schema extraction

- Swagger UI: `http://localhost:8002/docs`   - Content enhancement

- ReDoc: `http://localhost:8002/redoc`   - Job matching

   - CV building

### Code Structure

```3. **API Routes** (`app/api/routes/`)

app/   - RESTful endpoints

├── agents/          # LangGraph agent implementation   - Request validation

├── api/             # FastAPI routes and endpoints   - Error handling

├── core/            # Configuration and dependencies

├── models/          # Pydantic models4. **Core Configuration** (`app/core/`)

├── services/        # Business logic and external integrations   - Settings management

├── static/          # Frontend files   - Dependency injection

└── tools/           # Agent tools and utilities   - LLM initialization

```

## 🔐 Security

## 🔐 Security

- API keys stored in `.env` (never committed)

- API keys stored in `.env` (never committed)- Bearer token authentication for CV operations

- Input validation with Pydantic- Input validation with Pydantic

- CORS middleware configured- CORS middleware configured

- File upload size limits- File upload size limits

- No hardcoded credentials

## 🤝 Contributing

## 📝 Usage Examples

1. Fork the repository

### Extract CV from PDF2. Create a feature branch (`git checkout -b feature/amazing-feature`)

1. Navigate to `http://localhost:8002`3. Commit your changes (`git commit -m 'Add amazing feature'`)

2. Click "Upload Resume"4. Push to the branch (`git push origin feature/amazing-feature`)

3. Select PDF/DOCX/TXT file5. Open a Pull Request

4. Data automatically extracted and displayed

## 📝 License

### Edit Resume

1. Click on any field to editMIT License - see LICENSE file for details

2. See live preview on the right

3. Changes sync in real-time## 🙏 Acknowledgments



### Choose Template- OpenAI for GPT models

1. Browse templates in carousel- LangChain team for the framework

2. Click to select- FastAPI for the amazing web framework

3. Preview updates instantly

## 📧 Contact

### Export Resume

1. Click "Export" button- GitHub: [@husainf4l](https://github.com/husainf4l)

2. Choose format (PDF, DOCX, HTML)- Email: husainf4l@gmail.com

3. File downloads automatically

## 🗺️ Roadmap

## 🤝 Contributing

- [ ] PostgreSQL integration for CV storage

1. Create feature branch: `git checkout -b feature/amazing-feature`- [ ] Redis caching for improved performance

2. Make changes and test- [ ] PDF generation with custom templates

3. Commit: `git commit -m 'Add amazing feature'`- [ ] Multi-language CV support

4. Push: `git push origin feature/amazing-feature`- [ ] Resume scoring system

5. Open Pull Request- [ ] Cover letter generation

- [ ] Interview preparation assistant

## 📄 License- [ ] LinkedIn profile optimization


This project is proprietary.

## 📞 Support

For issues or questions, please contact the development team.

---

**Version**: 2.0  
**Status**: Production Ready  
**Last Updated**: November 2024
