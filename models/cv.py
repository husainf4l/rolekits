from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class CV(Base):
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Personal Information
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50))
    address = Column(String(500))
    linkedin = Column(String(255))
    github = Column(String(255))
    website = Column(String(255))
    
    # Professional Summary
    summary = Column(Text)
    
    # Work Experience (JSON or separate table)
    experience = Column(Text)  # Store as JSON string or create separate Experience table
    
    # Education (JSON or separate table)
    education = Column(Text)  # Store as JSON string or create separate Education table
    
    # Skills
    skills = Column(Text)  # Store as comma-separated or JSON
    
    # Languages
    languages = Column(Text)  # Store as JSON
    
    # Certifications
    certifications = Column(Text)  # Store as JSON
    
    # Projects
    projects = Column(Text)  # Store as JSON
    
    # References
    references = Column(Text)  # Store as JSON
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="cvs")
