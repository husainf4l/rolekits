from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from database import AsyncSessionLocal
from models import User
from routers.auth import get_current_user
from schemas.cv import CVCreate, CVUpdate, CVResponse
from services.cv import CVService

router = APIRouter(prefix="/cv", tags=["CV"])

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

@router.post("/", response_model=CVResponse, status_code=status.HTTP_201_CREATED)
async def create_cv(
    cv_data: CVCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new CV for the current user"""
    cv = await CVService.create_cv(db, cv_data, current_user.id)
    return cv

@router.get("/", response_model=List[CVResponse])
async def get_my_cvs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all CVs for the current user"""
    cvs = await CVService.get_user_cvs(db, current_user.id)
    return cvs

@router.get("/{cv_id}", response_model=CVResponse)
async def get_cv(
    cv_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific CV by ID"""
    cv = await CVService.get_cv(db, cv_id)
    
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    
    # Ensure user owns this CV
    if cv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this CV")
    
    return cv

@router.put("/{cv_id}", response_model=CVResponse)
async def update_cv(
    cv_id: int,
    cv_data: CVUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a CV"""
    # First check if CV exists and user owns it
    cv = await CVService.get_cv(db, cv_id)
    
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    
    if cv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this CV")
    
    updated_cv = await CVService.update_cv(db, cv_id, cv_data)
    return updated_cv

@router.delete("/{cv_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cv(
    cv_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a CV"""
    # First check if CV exists and user owns it
    cv = await CVService.get_cv(db, cv_id)
    
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    
    if cv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this CV")
    
    await CVService.delete_cv(db, cv_id)
    return None
