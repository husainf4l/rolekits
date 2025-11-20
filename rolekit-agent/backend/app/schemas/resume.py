from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ResumeBase(BaseModel):
    title: Optional[str] = Field(default="Untitled Resume", max_length=255)
    template_id: Optional[UUID] = None
    content: Dict[str, Any] = Field(default_factory=dict)
    is_default: bool = False


class ResumeCreate(ResumeBase):
    pass


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[UUID] = None
    content: Optional[Dict[str, Any]] = None
    is_default: Optional[bool] = None


class ResumeResponse(ResumeBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

