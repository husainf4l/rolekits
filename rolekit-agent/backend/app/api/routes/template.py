from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.models.template import Template
from app.schemas.template import TemplateResponse

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("", response_model=List[TemplateResponse])
def list_templates(db: Session = Depends(get_db_session)) -> List[Template]:
    return db.query(Template).filter(Template.is_active.is_(True)).order_by(Template.name).all()


@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(template_id: UUID, db: Session = Depends(get_db_session)) -> Template:
    template = (
        db.query(Template)
        .filter(Template.id == template_id, Template.is_active.is_(True))
        .first()
    )
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return template

