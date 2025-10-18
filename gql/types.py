import strawberry
from typing import Optional, List
from datetime import datetime

@strawberry.type
class Experience:
    company: str
    position: str
    start_date: str
    end_date: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None

@strawberry.type
class Education:
    institution: str
    degree: str
    field_of_study: str
    start_date: str
    end_date: Optional[str] = None
    grade: Optional[str] = None
    description: Optional[str] = None

@strawberry.type
class Language:
    language: str
    proficiency: str

@strawberry.type
class Certification:
    name: str
    issuing_organization: str
    issue_date: str
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None

@strawberry.type
class Project:
    name: str
    description: str
    technologies: List[str]
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    url: Optional[str] = None

@strawberry.type
class Reference:
    name: str
    position: str
    company: str
    email: Optional[str] = None
    phone: Optional[str] = None

@strawberry.type
class User:
    id: int
    username: str

@strawberry.type
class CV:
    id: int
    user_id: int
    full_name: Optional[str] = None
    email: Optional[str] = None
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
    created_at: str
    updated_at: str

# Input types for mutations
@strawberry.input
class ExperienceInput:
    company: str
    position: str
    start_date: str
    end_date: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None

@strawberry.input
class EducationInput:
    institution: str
    degree: str
    field_of_study: str
    start_date: str
    end_date: Optional[str] = None
    grade: Optional[str] = None
    description: Optional[str] = None

@strawberry.input
class LanguageInput:
    language: str
    proficiency: str

@strawberry.input
class CertificationInput:
    name: str
    issuing_organization: str
    issue_date: str
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None

@strawberry.input
class ProjectInput:
    name: str
    description: str
    technologies: List[str]
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    url: Optional[str] = None

@strawberry.input
class ReferenceInput:
    name: str
    position: str
    company: str
    email: Optional[str] = None
    phone: Optional[str] = None

@strawberry.input
class CVInput:
    fullName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    summary: Optional[str] = None
    experience: Optional[List[ExperienceInput]] = None
    education: Optional[List[EducationInput]] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[LanguageInput]] = None
    certifications: Optional[List[CertificationInput]] = None
    projects: Optional[List[ProjectInput]] = None
    references: Optional[List[ReferenceInput]] = None

@strawberry.input
class CVUpdateInput:
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    summary: Optional[str] = None
    experience: Optional[List[ExperienceInput]] = None
    education: Optional[List[EducationInput]] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[LanguageInput]] = None
    certifications: Optional[List[CertificationInput]] = None
    projects: Optional[List[ProjectInput]] = None
    references: Optional[List[ReferenceInput]] = None

@strawberry.type
class LoginResponse:
    access_token: str
    token_type: str

@strawberry.input
class LoginInput:
    username: str
    password: str

@strawberry.input
class SignupInput:
    username: str
    password: str
