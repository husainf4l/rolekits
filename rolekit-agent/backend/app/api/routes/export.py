from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.deps import CurrentUser, get_current_user, get_db_session
from app.models.resume import Resume
from app.models.template import Template
from app.services.export_service import ExportService

router = APIRouter(prefix="/resumes", tags=["export"])


@router.post("/{resume_id}/export")
def export_resume(
    resume_id: UUID,
    format: str = "pdf",
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    template = None
    if resume.template_id:
        template = db.query(Template).filter(Template.id == resume.template_id).first()

    service = ExportService()
    if format == "pdf":
        html_template = template.html_template if template else f"<h1>{resume.title}</h1>"
        if template:
            html_template = html_template.replace(
                "%TEMPLATE_CSS%", template.css_styles or ""
            )
        content = service.generate_pdf(resume, html_template)
        media_type = "application/pdf"
    elif format == "docx":
        content = service.export_docx(resume)
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")

    return Response(content=content, media_type=media_type)

