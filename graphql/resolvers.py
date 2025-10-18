import strawberry
from typing import List, Optional
from strawberry.types import Info
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from jose import jwt, JWTError

from graphql.types import CV, User, CVInput, CVUpdateInput, LoginResponse, LoginInput, SignupInput
from models import CV as CVModel, User as UserModel
from services.cv import CVService
from services.auth import get_password_hash, verify_password, create_access_token, settings
from database import AsyncSessionLocal
from datetime import timedelta
import json

def get_current_user_from_token(token: str) -> Optional[UserModel]:
    """Helper to get user from JWT token"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None

def parse_cv_to_graphql(cv: CVModel) -> CV:
    """Convert database CV to GraphQL CV type"""
    return CV(
        id=cv.id,
        user_id=cv.user_id,
        full_name=cv.full_name,
        email=cv.email,
        phone=cv.phone,
        address=cv.address,
        linkedin=cv.linkedin,
        github=cv.github,
        website=cv.website,
        summary=cv.summary,
        experience=json.loads(cv.experience) if cv.experience else None,
        education=json.loads(cv.education) if cv.education else None,
        skills=json.loads(cv.skills) if cv.skills else None,
        languages=json.loads(cv.languages) if cv.languages else None,
        certifications=json.loads(cv.certifications) if cv.certifications else None,
        projects=json.loads(cv.projects) if cv.projects else None,
        references=json.loads(cv.references) if cv.references else None,
        created_at=cv.created_at,
        updated_at=cv.updated_at
    )

@strawberry.type
class Query:
    @strawberry.field
    async def me(self, info: Info) -> Optional[User]:
        """Get current authenticated user"""
        token = info.context.get("token")
        if not token:
            raise Exception("Not authenticated")
        
        username = get_current_user_from_token(token)
        if not username:
            raise Exception("Invalid token")
        
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(UserModel).filter(UserModel.username == username))
            user = result.scalar_one_or_none()
            if not user:
                raise Exception("User not found")
            
            return User(id=user.id, username=user.username)
    
    @strawberry.field
    async def my_cvs(self, info: Info) -> List[CV]:
        """Get all CVs for the current user"""
        token = info.context.get("token")
        if not token:
            raise Exception("Not authenticated")
        
        username = get_current_user_from_token(token)
        if not username:
            raise Exception("Invalid token")
        
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(UserModel).filter(UserModel.username == username))
            user = result.scalar_one_or_none()
            if not user:
                raise Exception("User not found")
            
            cvs = await CVService.get_user_cvs(db, user.id)
            return [parse_cv_to_graphql(cv) for cv in cvs]
    
    @strawberry.field
    async def cv(self, info: Info, cv_id: int) -> Optional[CV]:
        """Get a specific CV by ID"""
        token = info.context.get("token")
        if not token:
            raise Exception("Not authenticated")
        
        username = get_current_user_from_token(token)
        if not username:
            raise Exception("Invalid token")
        
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(UserModel).filter(UserModel.username == username))
            user = result.scalar_one_or_none()
            if not user:
                raise Exception("User not found")
            
            cv = await CVService.get_cv(db, cv_id)
            if not cv:
                raise Exception("CV not found")
            
            if cv.user_id != user.id:
                raise Exception("Not authorized to access this CV")
            
            return parse_cv_to_graphql(cv)

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def signup(self, input: SignupInput) -> User:
        """Create a new user account"""
        async with AsyncSessionLocal() as db:
            # Check if user exists
            result = await db.execute(select(UserModel).filter(UserModel.username == input.username))
            existing_user = result.scalar_one_or_none()
            if existing_user:
                raise Exception("Username already registered")
            
            # Create user
            hashed_password = get_password_hash(input.password)
            new_user = UserModel(username=input.username, hashed_password=hashed_password)
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)
            
            return User(id=new_user.id, username=new_user.username)
    
    @strawberry.mutation
    async def login(self, input: LoginInput) -> LoginResponse:
        """Login and get access token"""
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(UserModel).filter(UserModel.username == input.username))
            user = result.scalar_one_or_none()
            
            if not user or not verify_password(input.password, user.hashed_password):
                raise Exception("Incorrect username or password")
            
            access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
            access_token = create_access_token(
                data={"sub": user.username}, expires_delta=access_token_expires
            )
            
            return LoginResponse(access_token=access_token, token_type="bearer")
    
    @strawberry.mutation
    async def create_cv(self, info: Info, input: CVInput) -> CV:
        """Create a new CV"""
        token = info.context.get("token")
        if not token:
            raise Exception("Not authenticated")
        
        username = get_current_user_from_token(token)
        if not username:
            raise Exception("Invalid token")
        
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(UserModel).filter(UserModel.username == username))
            user = result.scalar_one_or_none()
            if not user:
                raise Exception("User not found")
            
            # Convert input to dict
            cv_data = {
                "full_name": input.full_name,
                "email": input.email,
                "phone": input.phone,
                "address": input.address,
                "linkedin": input.linkedin,
                "github": input.github,
                "website": input.website,
                "summary": input.summary,
                "experience": json.dumps([e.__dict__ for e in input.experience]) if input.experience else None,
                "education": json.dumps([e.__dict__ for e in input.education]) if input.education else None,
                "skills": json.dumps(input.skills) if input.skills else None,
                "languages": json.dumps([l.__dict__ for l in input.languages]) if input.languages else None,
                "certifications": json.dumps([c.__dict__ for c in input.certifications]) if input.certifications else None,
                "projects": json.dumps([p.__dict__ for p in input.projects]) if input.projects else None,
                "references": json.dumps([r.__dict__ for r in input.references]) if input.references else None,
                "user_id": user.id
            }
            
            cv = CVModel(**cv_data)
            db.add(cv)
            await db.commit()
            await db.refresh(cv)
            
            return parse_cv_to_graphql(cv)
    
    @strawberry.mutation
    async def update_cv(self, info: Info, cv_id: int, input: CVUpdateInput) -> CV:
        """Update a CV"""
        token = info.context.get("token")
        if not token:
            raise Exception("Not authenticated")
        
        username = get_current_user_from_token(token)
        if not username:
            raise Exception("Invalid token")
        
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(UserModel).filter(UserModel.username == username))
            user = result.scalar_one_or_none()
            if not user:
                raise Exception("User not found")
            
            cv = await CVService.get_cv(db, cv_id)
            if not cv:
                raise Exception("CV not found")
            
            if cv.user_id != user.id:
                raise Exception("Not authorized to update this CV")
            
            # Update fields
            if input.full_name is not None:
                cv.full_name = input.full_name
            if input.email is not None:
                cv.email = input.email
            if input.phone is not None:
                cv.phone = input.phone
            if input.address is not None:
                cv.address = input.address
            if input.linkedin is not None:
                cv.linkedin = input.linkedin
            if input.github is not None:
                cv.github = input.github
            if input.website is not None:
                cv.website = input.website
            if input.summary is not None:
                cv.summary = input.summary
            if input.experience is not None:
                cv.experience = json.dumps([e.__dict__ for e in input.experience])
            if input.education is not None:
                cv.education = json.dumps([e.__dict__ for e in input.education])
            if input.skills is not None:
                cv.skills = json.dumps(input.skills)
            if input.languages is not None:
                cv.languages = json.dumps([l.__dict__ for l in input.languages])
            if input.certifications is not None:
                cv.certifications = json.dumps([c.__dict__ for c in input.certifications])
            if input.projects is not None:
                cv.projects = json.dumps([p.__dict__ for p in input.projects])
            if input.references is not None:
                cv.references = json.dumps([r.__dict__ for r in input.references])
            
            await db.commit()
            await db.refresh(cv)
            
            return parse_cv_to_graphql(cv)
    
    @strawberry.mutation
    async def delete_cv(self, info: Info, cv_id: int) -> bool:
        """Delete a CV"""
        token = info.context.get("token")
        if not token:
            raise Exception("Not authenticated")
        
        username = get_current_user_from_token(token)
        if not username:
            raise Exception("Invalid token")
        
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(UserModel).filter(UserModel.username == username))
            user = result.scalar_one_or_none()
            if not user:
                raise Exception("User not found")
            
            cv = await CVService.get_cv(db, cv_id)
            if not cv:
                raise Exception("CV not found")
            
            if cv.user_id != user.id:
                raise Exception("Not authorized to delete this CV")
            
            await CVService.delete_cv(db, cv_id)
            return True
