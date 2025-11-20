# Resume Builder Backend (Phase 3)

This FastAPI service implements the Phase 3 checklist from `QUICK_IMPLEMENTATION_GUIDE.md`: database models, REST endpoints for resumes/templates, export flows, and AI helpers.

## Project Layout

```
backend/
├── app/
│   ├── api/                 # FastAPI routers + dependencies
│   ├── core/                # Settings
│   ├── db/                  # SQLAlchemy session
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Export + AI integrations
│   └── main.py              # FastAPI app entrypoint
├── Dockerfile
└── requirements.txt
```

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Environment variables (stored in the repo-root `.env`) should include:

- `DATABASE_URL=postgresql+psycopg://USER:PASS@localhost:5432/resume_builder`
- `OPENAI_API_KEY=sk-your-key`
- `JWT_SECRET_KEY=super-secret-value`
- `JWT_ALGORITHM=HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES=60`
- `ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8000` (optional)

## Running

```bash
uvicorn app.main:app --reload --port 8000
```

Or use Docker Compose from the repo root:

```bash
docker compose up backend db
```

Visit `http://localhost:8000/docs` for interactive API docs.

## Database Migrations & Seeds

```bash
# Apply migrations
cd backend
alembic upgrade head

# Seed default templates
python -m app.db.seeds
```

The Alembic configuration lives under `backend/alembic/`. The seed command loads the curated templates from `app/data/templates.py`.

## Endpoints

- `POST /api/v1/auth/signup` – create an account + receive JWT
- `POST /api/v1/auth/login` – exchange credentials for JWT
- `GET /api/v1/auth/me` – profile of the current token
- `GET /api/v1/resumes` – list the authenticated user’s resumes
- `POST /api/v1/resumes` – create a resume
- `PATCH /api/v1/resumes/{id}` – update resume content/template
- `POST /api/v1/resumes/{id}/export?format=pdf|docx` – generate exports
- `GET /api/v1/templates` – list available templates
- `POST /api/v1/ai/enhance-content` – AI text enhancements
- `POST /api/v1/ai/generate-cover-letter` – cover letter generation

Authentication is stubbed for Phase 3 (a fake user is issued when no Bearer token exists). Replace `get_current_user` in `app/api/deps.py` with real JWT logic when ready.
