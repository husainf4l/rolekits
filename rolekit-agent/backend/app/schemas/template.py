from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TemplateBase(BaseModel):
    name: str = Field(..., max_length=255)
    category: Optional[str] = Field(default=None, max_length=50)
    html_template: str
    css_styles: str
    preview_image_url: Optional[str] = Field(default=None, max_length=500)
    is_ats_optimized: bool = True
    is_active: bool = True


class TemplateCreate(TemplateBase):
    pass


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    html_template: Optional[str] = None
    css_styles: Optional[str] = None
    preview_image_url: Optional[str] = None
    is_ats_optimized: Optional[bool] = None
    is_active: Optional[bool] = None


class TemplateResponse(TemplateBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

