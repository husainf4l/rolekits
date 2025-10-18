from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Base schemas for nested objects
class Experience(BaseModel):
    company: str
    position: str
    start_date: str
    end_date: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None

class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    start_date: str
    end_date: Optional[str] = None
    grade: Optional[str] = None
    description: Optional[str] = None

class Language(BaseModel):
    language: str
    proficiency: str  # e.g., Native, Fluent, Intermediate, Basic

class Certification(BaseModel):
    name: str
    issuing_organization: str
    issue_date: str
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None

class Project(BaseModel):
    name: str
    description: str
    technologies: List[str]
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    url: Optional[str] = None

class Reference(BaseModel):
    name: str
    position: str
    company: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

# Main CV schemas
class CVBase(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    summary: Optional[str] = None
    experience: Optional[List[Experience]] = None
    education: Optional[List[Education]] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[Language]] = None
    certifications: Optional[List[Certification]] = None
    projects: Optional[List[Project]] = None
    references: Optional[List[Reference]] = None

class CVCreate(CVBase):
    pass

class CVUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    summary: Optional[str] = None
    experience: Optional[List[Experience]] = None
    education: Optional[List[Education]] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[Language]] = None
    certifications: Optional[List[Certification]] = None
    projects: Optional[List[Project]] = None
    references: Optional[List[Reference]] = None

class CVResponse(CVBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
