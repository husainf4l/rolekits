"""
CV Data Models and Schemas
Defines Pydantic models for structured CV data
"""
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import date


class ContactInfo(BaseModel):
    """Contact information"""
    full_name: str = Field(..., description="Full name")
    email: Optional[EmailStr] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    location: Optional[str] = Field(None, description="City, Country")
    linkedin: Optional[str] = Field(None, description="LinkedIn URL")
    github: Optional[str] = Field(None, description="GitHub URL")
    website: Optional[str] = Field(None, description="Personal website")
    portfolio: Optional[str] = Field(None, description="Portfolio URL")


class WorkExperience(BaseModel):
    """Work experience entry"""
    company: str = Field(..., description="Company name")
    position: str = Field(..., description="Job title/position")
    location: Optional[str] = Field(None, description="Job location")
    start_date: str = Field(..., description="Start date (YYYY-MM or Month YYYY)")
    end_date: Optional[str] = Field(None, description="End date or 'Present'")
    description: Optional[str] = Field(None, description="Job description")
    achievements: List[str] = Field(default_factory=list, description="Key achievements with metrics")
    technologies: List[str] = Field(default_factory=list, description="Technologies used")


class Education(BaseModel):
    """Education entry"""
    institution: str = Field(..., description="School/University name")
    degree: str = Field(..., description="Degree type (BS, MS, PhD, etc.)")
    field_of_study: str = Field(..., description="Major/Field of study")
    location: Optional[str] = Field(None, description="School location")
    start_date: Optional[str] = Field(None, description="Start date")
    end_date: Optional[str] = Field(None, description="Graduation date or 'Expected YYYY'")
    gpa: Optional[str] = Field(None, description="GPA (if notable)")
    honors: List[str] = Field(default_factory=list, description="Honors, awards, relevant coursework")


class Project(BaseModel):
    """Project entry"""
    name: str = Field(..., description="Project name")
    description: str = Field(..., description="Project description")
    url: Optional[str] = Field(None, description="Project URL/demo")
    repository: Optional[str] = Field(None, description="GitHub repository")
    technologies: List[str] = Field(default_factory=list, description="Technologies used")
    highlights: List[str] = Field(default_factory=list, description="Key features or outcomes")


class Certification(BaseModel):
    """Certification entry"""
    name: str = Field(..., description="Certification name")
    issuer: str = Field(..., description="Issuing organization")
    date_obtained: Optional[str] = Field(None, description="Date obtained")
    expiry_date: Optional[str] = Field(None, description="Expiry date if applicable")
    credential_id: Optional[str] = Field(None, description="Credential ID")
    url: Optional[str] = Field(None, description="Verification URL")


class Language(BaseModel):
    """Language proficiency"""
    language: str = Field(..., description="Language name")
    proficiency: str = Field(..., description="Proficiency level (Native, Fluent, Professional, etc.)")


class Skill(BaseModel):
    """Skill with optional proficiency"""
    name: str = Field(..., description="Skill name")
    category: Optional[str] = Field(None, description="Category (Programming, Tools, Soft Skills)")
    proficiency: Optional[str] = Field(None, description="Proficiency level")


class CVData(BaseModel):
    """Complete CV data structure"""
    contact: ContactInfo = Field(..., description="Contact information")
    summary: Optional[str] = Field(None, description="Professional summary/objective")
    experience: List[WorkExperience] = Field(default_factory=list, description="Work experience")
    education: List[Education] = Field(default_factory=list, description="Education history")
    skills: List[str] = Field(default_factory=list, description="Skills list")
    projects: List[Project] = Field(default_factory=list, description="Notable projects")
    certifications: List[Certification] = Field(default_factory=list, description="Certifications")
    languages: List[Language] = Field(default_factory=list, description="Language proficiencies")
    awards: List[str] = Field(default_factory=list, description="Awards and honors")
    publications: List[str] = Field(default_factory=list, description="Publications")
    volunteer: List[str] = Field(default_factory=list, description="Volunteer experience")
    
    class Config:
        json_schema_extra = {
            "example": {
                "contact": {
                    "full_name": "John Doe",
                    "email": "john.doe@example.com",
                    "phone": "+1-234-567-8900",
                    "location": "San Francisco, CA",
                    "linkedin": "https://linkedin.com/in/johndoe",
                    "github": "https://github.com/johndoe"
                },
                "summary": "Senior Software Engineer with 5+ years experience...",
                "experience": [],
                "education": [],
                "skills": ["Python", "JavaScript", "React", "AWS"]
            }
        }


class CVEnhancementRequest(BaseModel):
    """Request for CV enhancement"""
    cv_data: CVData
    target_role: Optional[str] = Field(None, description="Target job role")
    job_description: Optional[str] = Field(None, description="Job description for optimization")
    enhancement_focus: List[str] = Field(
        default_factory=lambda: ["clarity", "impact", "keywords"],
        description="Focus areas: clarity, impact, keywords, tone, brevity"
    )


class CVVersion(BaseModel):
    """CV version for tracking"""
    version_id: str
    cv_data: CVData
    created_at: str
    notes: Optional[str] = None
    score: Optional[float] = None  # Quality score 0-100


class JobMatchResult(BaseModel):
    """Job matching analysis result"""
    match_score: float = Field(..., description="Match score 0-100")
    matched_keywords: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    ats_friendly: bool = Field(default=True)
