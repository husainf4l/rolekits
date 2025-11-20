# 🚀 Quick Reference Card

## Essential Commands

```bash
# Setup (first time only)
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run application
python main.py

# Run with hot reload
uvicorn main:app --reload --port 8002

# Run tests
pytest tests/ -v

# Docker setup
docker-compose up
```

## Access Points

| URL | Purpose |
|-----|---------|
| http://localhost:8002 | Main Application |
| http://localhost:8002/docs | Swagger API Docs |
| http://localhost:8002/redoc | ReDoc Documentation |

## File Locations

| File | Purpose | Size |
|------|---------|------|
| `main.py` | FastAPI entry | 7.1 KB |
| `static/app.js` | Frontend logic | 22 KB |
| `static/styles.css` | Frontend styling | 23 KB |
| `app/api/routes/cv_routes.py` | CV endpoints | - |
| `app/services/cv/` | CV services | - |

## Documentation

| File | Content |
|------|---------|
| `README.md` | Main guide + setup |
| `PROJECT_STRUCTURE.md` | Architecture + structure |
| `CLEANUP_COMPLETE.md` | Cleanup summary |
| `FINAL_REPORT.md` | Executive report |

## API Endpoints

```
POST   /api/extract       Extract CV from file
POST   /api/enhance       AI enhancement
POST   /api/build         Build resume HTML
POST   /api/export        Export to PDF/DOCX
GET    /api/templates     Get templates list
GET    /api/health        Health check
```

## Frontend Architecture

- **Framework**: Vanilla JavaScript (ES6+)
- **Styling**: Pure CSS3
- **State**: Centralized state object
- **Events**: Event delegation via `handleAction()`
- **Dependencies**: ZERO (lightweight!)

## Backend Architecture

- **Framework**: FastAPI
- **AI**: LangChain + OpenAI GPT-4o-mini
- **PDF**: WeasyPrint
- **Parsing**: PyMuPDF, python-docx
- **Agents**: LangGraph streaming

## Environment Variables

```env
OPENAI_API_KEY=sk-...          # Required
OPENAI_MODEL=gpt-4o-mini       # Default
OPENAI_TEMPERATURE=0.7         # Default
```

## Project Statistics

- Frontend: 45 KB (zero dependencies)
- Backend: 580 KB
- Tests: 36 KB
- Documentation: 50 KB
- Total: ~660 KB

## Key Features

✅ AI-powered CV extraction  
✅ 6 professional templates  
✅ Live preview  
✅ Multi-format export (PDF, DOCX, HTML)  
✅ Responsive design  
✅ LangGraph agent system  

## Common Tasks

### Add a new API endpoint
1. Create route in `app/api/routes/`
2. Add service logic in `app/services/`
3. Import in `main.py`
4. Test with `/docs`

### Style frontend element
1. Add CSS class in `static/styles.css`
2. Apply to HTML in `app.js`
3. Reload browser

### Extract CV data
1. Upload file via UI
2. API calls `/api/extract`
3. LLM extracts structured data
4. Display in editor

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8002 in use | `lsof -i :8002` then kill process |
| API key error | Check `.env` has valid OPENAI_API_KEY |
| CSS not updating | Clear browser cache (Ctrl+Shift+Delete) |
| Tests fail | Run `pip install -r requirements.txt` again |

## Resources

- FastAPI: https://fastapi.tiangolo.com
- LangChain: https://python.langchain.com
- OpenAI: https://platform.openai.com/docs

---

**Version**: 2.0  
**Status**: ✅ Production Ready  
**Last Updated**: November 2024
