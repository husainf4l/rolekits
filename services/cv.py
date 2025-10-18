from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.cv import CV
from schemas.cv import CVCreate, CVUpdate
import json
from typing import List, Optional

class CVService:
    @staticmethod
    async def create_cv(db: AsyncSession, cv_data: CVCreate, user_id: int) -> CV:
        """Create a new CV for a user"""
        # Convert lists/dicts to JSON strings for storage
        cv_dict = cv_data.model_dump()
        
        # Convert complex fields to JSON strings
        if cv_dict.get('experience'):
            cv_dict['experience'] = json.dumps([exp.model_dump() if hasattr(exp, 'model_dump') else exp for exp in cv_dict['experience']])
        if cv_dict.get('education'):
            cv_dict['education'] = json.dumps([edu.model_dump() if hasattr(edu, 'model_dump') else edu for edu in cv_dict['education']])
        if cv_dict.get('skills'):
            cv_dict['skills'] = json.dumps(cv_dict['skills'])
        if cv_dict.get('languages'):
            cv_dict['languages'] = json.dumps([lang.model_dump() if hasattr(lang, 'model_dump') else lang for lang in cv_dict['languages']])
        if cv_dict.get('certifications'):
            cv_dict['certifications'] = json.dumps([cert.model_dump() if hasattr(cert, 'model_dump') else cert for cert in cv_dict['certifications']])
        if cv_dict.get('projects'):
            cv_dict['projects'] = json.dumps([proj.model_dump() if hasattr(proj, 'model_dump') else proj for proj in cv_dict['projects']])
        if cv_dict.get('references'):
            cv_dict['references'] = json.dumps([ref.model_dump() if hasattr(ref, 'model_dump') else ref for ref in cv_dict['references']])
        
        db_cv = CV(**cv_dict, user_id=user_id)
        db.add(db_cv)
        await db.commit()
        await db.refresh(db_cv)
        return db_cv
    
    @staticmethod
    async def get_cv(db: AsyncSession, cv_id: int) -> Optional[CV]:
        """Get a CV by ID"""
        result = await db.execute(select(CV).filter(CV.id == cv_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_user_cvs(db: AsyncSession, user_id: int) -> List[CV]:
        """Get all CVs for a user"""
        result = await db.execute(select(CV).filter(CV.user_id == user_id))
        return result.scalars().all()
    
    @staticmethod
    async def update_cv(db: AsyncSession, cv_id: int, cv_data: CVUpdate) -> Optional[CV]:
        """Update a CV"""
        result = await db.execute(select(CV).filter(CV.id == cv_id))
        db_cv = result.scalar_one_or_none()
        
        if not db_cv:
            return None
        
        # Update fields
        update_data = cv_data.model_dump(exclude_unset=True)
        
        # Convert complex fields to JSON strings
        if 'experience' in update_data and update_data['experience']:
            update_data['experience'] = json.dumps([exp.model_dump() if hasattr(exp, 'model_dump') else exp for exp in update_data['experience']])
        if 'education' in update_data and update_data['education']:
            update_data['education'] = json.dumps([edu.model_dump() if hasattr(edu, 'model_dump') else edu for edu in update_data['education']])
        if 'skills' in update_data and update_data['skills']:
            update_data['skills'] = json.dumps(update_data['skills'])
        if 'languages' in update_data and update_data['languages']:
            update_data['languages'] = json.dumps([lang.model_dump() if hasattr(lang, 'model_dump') else lang for lang in update_data['languages']])
        if 'certifications' in update_data and update_data['certifications']:
            update_data['certifications'] = json.dumps([cert.model_dump() if hasattr(cert, 'model_dump') else cert for cert in update_data['certifications']])
        if 'projects' in update_data and update_data['projects']:
            update_data['projects'] = json.dumps([proj.model_dump() if hasattr(proj, 'model_dump') else proj for proj in update_data['projects']])
        if 'references' in update_data and update_data['references']:
            update_data['references'] = json.dumps([ref.model_dump() if hasattr(ref, 'model_dump') else ref for ref in update_data['references']])
        
        for field, value in update_data.items():
            setattr(db_cv, field, value)
        
        await db.commit()
        await db.refresh(db_cv)
        return db_cv
    
    @staticmethod
    async def delete_cv(db: AsyncSession, cv_id: int) -> bool:
        """Delete a CV"""
        result = await db.execute(select(CV).filter(CV.id == cv_id))
        db_cv = result.scalar_one_or_none()
        
        if not db_cv:
            return False
        
        await db.delete(db_cv)
        await db.commit()
        return True
