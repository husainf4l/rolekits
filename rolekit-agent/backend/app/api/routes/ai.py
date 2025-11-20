from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.deps import CurrentUser, get_current_user, get_db_session
from app.models.resume import Resume
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/enhance-content")
def enhance_content(
    text: str,
    context: str,
    ai_service: AIService = Depends(AIService),
):
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    return ai_service.enhance_text(text, context)


@router.post("/generate-cover-letter")
def generate_cover_letter(
    resume_id: UUID,
    job_description: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db_session),
    ai_service: AIService = Depends(AIService),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    content = ai_service.generate_cover_letter(resume.content, job_description)
    return {"cover_letter": content}

