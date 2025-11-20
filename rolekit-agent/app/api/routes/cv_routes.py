"""
CV Processing API Routes
Endpoints for CV enhancement, parsing, and optimization
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response, FileResponse
from typing import Optional
from pydantic import BaseModel

from app.models.cv_models import CVData, CVEnhancementRequest, JobMatchResult
from app.services.cv import (
    CVSchemaExtractor,
    CVSchemaValidator,
    ProfileEnhancer,
    ImpactQuantifier,
    JobMatchOptimizer,
    ATSOptimizer,
    CVBuilder
)
from app.services.parser.document_parser import parse_cv_document
import json


router = APIRouter(prefix="/cv", tags=["CV Processing"])


# Request/Response models
class ParseRequest(BaseModel):
    text: str
    target_role: Optional[str] = None


class EnhanceRequest(BaseModel):
    cv_data: CVData
    target_role: Optional[str] = None
    enhancement_focus: Optional[list[str]] = ["clarity", "impact", "keywords"]


class JobMatchRequest(BaseModel):
    cv_data: CVData
    job_description: str


class BuildRequest(BaseModel):
    cv_data: CVData
    format: str = "html"  # html, markdown, json
    style: Optional[str] = "modern"


@router.post("/parse/text")
async def parse_cv_from_text(request: ParseRequest):
    """
    Parse CV from plain text and extract structured data
    
    Args:
        request: Parse request with CV text
        
    Returns:
        Structured CV data
    """
    try:
        extractor = CVSchemaExtractor()
        
        if request.target_role:
            cv_data = await extractor.extract_with_context(
                request.text,
                target_role=request.target_role
            )
        else:
            cv_data = await extractor.extract(request.text)
        
        # Validate and clean
        cv_data = CVSchemaValidator.validate_and_clean(cv_data)
        
        return {
            "success": True,
            "cv_data": cv_data.model_dump(),
            "message": "CV parsed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse CV: {str(e)}")


@router.post("/parse/upload")
async def parse_cv_from_file(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None)
):
    """
    Parse CV from uploaded file (PDF, DOCX, TXT)
    
    Args:
        file: Uploaded CV file
        target_role: Optional target role for context
        
    Returns:
        Structured CV data
    """
    try:
        # Read file content
        file_bytes = await file.read()
        
        # Parse document
        cv_text = await parse_cv_document(file_bytes, file.filename)
        
        # Extract structured data
        extractor = CVSchemaExtractor()
        
        if target_role:
            cv_data = await extractor.extract_with_context(
                cv_text,
                target_role=target_role
            )
        else:
            cv_data = await extractor.extract(cv_text)
        
        # Validate and clean
        cv_data = CVSchemaValidator.validate_and_clean(cv_data)
        
        return {
            "success": True,
            "cv_data": cv_data.model_dump(),
            "filename": file.filename,
            "message": "CV parsed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")


@router.post("/enhance")
async def enhance_cv(request: EnhanceRequest):
    """
    Enhance CV content with professional phrasing and impact statements
    
    Args:
        request: Enhancement request
        
    Returns:
        Enhanced CV data
    """
    try:
        enhancer = ProfileEnhancer()
        
        enhanced_cv = await enhancer.enhance_full_cv(
            request.cv_data,
            target_role=request.target_role,
            enhancement_focus=request.enhancement_focus
        )
        
        return {
            "success": True,
            "cv_data": enhanced_cv.model_dump(),
            "message": "CV enhanced successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to enhance CV: {str(e)}")


@router.post("/enhance/summary")
async def enhance_summary(
    summary: str = Form(...),
    target_role: Optional[str] = Form(None),
    experience_level: Optional[str] = Form(None)
):
    """
    Enhance professional summary
    
    Args:
        summary: Original summary
        target_role: Target job role
        experience_level: junior, mid, senior, lead
        
    Returns:
        Enhanced summary
    """
    try:
        enhancer = ProfileEnhancer()
        
        enhanced = await enhancer.enhance_summary(
            summary,
            role=target_role,
            experience_level=experience_level
        )
        
        return {
            "success": True,
            "original": summary,
            "enhanced": enhanced
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to enhance summary: {str(e)}")


@router.post("/suggest-metrics")
async def suggest_metrics(achievement: str = Form(...)):
    """
    Suggest ways to add metrics to an achievement
    
    Args:
        achievement: Achievement description
        
    Returns:
        Suggestions with metrics
    """
    try:
        quantifier = ImpactQuantifier()
        
        suggestions = await quantifier.suggest_metrics(achievement)
        
        return {
            "success": True,
            "original": achievement,
            "suggestions": suggestions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to suggest metrics: {str(e)}")


@router.post("/match-job")
async def match_job(request: JobMatchRequest):
    """
    Calculate CV-job match score and provide optimization suggestions
    
    Args:
        request: Job match request
        
    Returns:
        Match result with score and recommendations
    """
    try:
        optimizer = JobMatchOptimizer()
        
        match_result = await optimizer.calculate_match_score(
            request.cv_data,
            request.job_description
        )
        
        return {
            "success": True,
            "match_result": match_result.model_dump()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to match job: {str(e)}")


@router.post("/optimize-for-job")
async def optimize_for_job(request: JobMatchRequest):
    """
    Optimize CV for specific job description
    
    Args:
        request: Job match request
        
    Returns:
        Optimized CV data
    """
    try:
        optimizer = JobMatchOptimizer()
        
        optimized_cv = await optimizer.optimize_cv_for_job(
            request.cv_data,
            request.job_description
        )
        
        return {
            "success": True,
            "cv_data": optimized_cv.model_dump(),
            "message": "CV optimized for job"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to optimize CV: {str(e)}")


@router.post("/check-ats")
async def check_ats_compatibility(cv_data: CVData):
    """
    Check ATS compatibility of CV
    
    Args:
        cv_data: CV data to check
        
    Returns:
        ATS compatibility report
    """
    try:
        report = await ATSOptimizer.check_ats_compatibility(cv_data)
        
        return {
            "success": True,
            "ats_report": report
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check ATS: {str(e)}")


@router.post("/build")
async def build_cv(request: BuildRequest):
    """
    Build formatted CV in specified format
    
    Args:
        request: Build request
        
    Returns:
        Formatted CV
    """
    try:
        builder = CVBuilder()
        
        if request.format == "html":
            content = builder.to_html(request.cv_data, style=request.style)
            media_type = "text/html"
        elif request.format == "markdown":
            content = builder.to_markdown(request.cv_data)
            media_type = "text/markdown"
        elif request.format == "json":
            content = builder.to_json(request.cv_data, pretty=True)
            media_type = "application/json"
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {request.format}")
        
        return Response(
            content=content,
            media_type=media_type,
            headers={
                "Content-Disposition": f'inline; filename="cv.{request.format}"'
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to build CV: {str(e)}")


@router.post("/validate")
async def validate_cv(cv_data: CVData):
    """
    Validate CV data quality
    
    Args:
        cv_data: CV data to validate
        
    Returns:
        Validation results
    """
    try:
        validator = CVSchemaValidator()
        
        validation_result = await validator.validate_with_llm(cv_data)
        
        return {
            "success": True,
            "validation": validation_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to validate CV: {str(e)}")
