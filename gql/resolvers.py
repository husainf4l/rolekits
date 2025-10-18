import strawberry
from typing import List, Optional, AsyncGenerator
from strawberry.types import Info
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import Request
from fastapi.responses import StreamingResponse
import json
from jose import jwt, JWTError

from gql.types import CV, User, CVInput, CVUpdateInput, LoginResponse, LoginInput, SignupInput
from models import CV as CVModel, User as UserModel
from services.cv import CVService
from services.auth import get_password_hash, verify_password, create_access_token, settings
from database import AsyncSessionLocal
from datetime import timedelta
import json
import asyncio

# Simple in-memory pub/sub for CV updates
cv_update_channels = {}

def publish_cv_update(user_id: int, cv: CV):
    """Publish CV update to subscribers"""
    if user_id in cv_update_channels:
        for queue in cv_update_channels[user_id]:
            try:
                queue.put_nowait(cv)
            except:
                pass  # Queue might be full or closed

def get_user_id_from_token(token: str) -> Optional[int]:
    """Get user ID from JWT token"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        if username is None:
            return None
        
        # Get user ID from database
        async def get_user_id():
            async with AsyncSessionLocal() as db:
                result = await db.execute(select(UserModel).filter(UserModel.username == username))
                user = result.scalar_one_or_none()
                return user.id if user else None
        
        # This is synchronous context, so we need to handle this differently
        # For now, return None and handle in subscription
        return None
    except JWTError:
        return None

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
        created_at=cv.created_at.isoformat() if cv.created_at else None,
        updated_at=cv.updated_at.isoformat() if cv.updated_at else None
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
    async def cv(self, info: Info, cv_id: Optional[int] = None) -> Optional[CV]:
        """Get a specific CV by ID"""
        if cv_id is None:
            raise Exception("cvId parameter is required")
        
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
            
            # Convert input to dict, allowing all fields to be optional
            cv_data = {
                "user_id": user.id
            }
            
            if input.fullName is not None:
                cv_data["full_name"] = input.fullName
            if input.email is not None:
                cv_data["email"] = input.email
            if input.phone is not None:
                cv_data["phone"] = input.phone
            if input.address is not None:
                cv_data["address"] = input.address
            if input.linkedin is not None:
                cv_data["linkedin"] = input.linkedin
            if input.github is not None:
                cv_data["github"] = input.github
            if input.website is not None:
                cv_data["website"] = input.website
            if input.summary is not None:
                cv_data["summary"] = input.summary
            if input.experience is not None:
                cv_data["experience"] = json.dumps([e.__dict__ for e in input.experience])
            if input.education is not None:
                cv_data["education"] = json.dumps([e.__dict__ for e in input.education])
            if input.skills is not None:
                cv_data["skills"] = json.dumps(input.skills)
            if input.languages is not None:
                cv_data["languages"] = json.dumps([l.__dict__ for l in input.languages])
            if input.certifications is not None:
                cv_data["certifications"] = json.dumps([c.__dict__ for c in input.certifications])
            if input.projects is not None:
                cv_data["projects"] = json.dumps([p.__dict__ for p in input.projects])
            if input.references is not None:
                cv_data["references"] = json.dumps([r.__dict__ for r in input.references])
            
            cv = CVModel(**cv_data)
            db.add(cv)
            await db.commit()
            await db.refresh(cv)
            
            parsed_cv = parse_cv_to_graphql(cv)
            # Publish update to subscribers
            publish_cv_update(user.id, parsed_cv)
            
            return parsed_cv
    
    @strawberry.mutation
    async def update_cv(self, info: Info, cv_id: int, input: Optional[CVUpdateInput] = None) -> CV:
        """Update a CV - field by field"""
        if input is None:
            raise Exception("input parameter is required")
        
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
            
            # Update only provided fields
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
            
            parsed_cv = parse_cv_to_graphql(cv)
            # Publish update to subscribers
            publish_cv_update(user.id, parsed_cv)
            
            return parsed_cv
    
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

# Server-Sent Events endpoint for CV updates
async def cv_updates_sse(cv_id: int, request: Request):
    """Server-Sent Events endpoint for real-time CV updates"""
    # Get token from query parameter since EventSource doesn't support custom headers
    token = request.query_params.get("token")
    if not token:
        return StreamingResponse(
            iter(["data: {\"error\": \"Not authenticated\"}\n\n"]),
            media_type="text/event-stream"
        )
    
    username = get_current_user_from_token(token)
    if not username:
        return StreamingResponse(
            iter(["data: {\"error\": \"Invalid token\"}\n\n"]),
            media_type="text/event-stream"
        )
    
    print(f"User {username} authenticated for CV {cv_id}")
    # Get user and verify CV ownership
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(UserModel).filter(UserModel.username == username))
        user = result.scalar_one_or_none()
        if not user:
            return StreamingResponse(
                iter(["data: {\"error\": \"User not found\"}\n\n"]),
                media_type="text/event-stream"
            )
        
        cv = await CVService.get_cv(db, cv_id)
        if not cv:
            return StreamingResponse(
                iter(["data: {\"error\": \"CV not found\"}\n\n"]),
                media_type="text/event-stream"
            )
        
        if cv.user_id != user.id:
            return StreamingResponse(
                iter(["data: {\"error\": \"Not authorized\"}\n\n"]),
                media_type="text/event-stream"
            )
    
    # Create a queue for this connection
    from asyncio import Queue
    queue = Queue()
    user_id = user.id
    
    if user_id not in cv_update_channels:
        cv_update_channels[user_id] = []
    cv_update_channels[user_id].append(queue)
    
    async def event_generator():
        try:
            # Send simplified initial CV data first
            initial_dict = {
                'id': cv.id,
                'user_id': cv.user_id,
                'full_name': cv.full_name or '',
                'email': cv.email or '',
                'phone': cv.phone or '',
                'address': cv.address or '',
                'linkedin': cv.linkedin or '',
                'github': cv.github or '',
                'website': cv.website or '',
                'summary': cv.summary or '',
                'experience': json.loads(cv.experience) if cv.experience else [],
                'education': json.loads(cv.education) if cv.education else [],
                'skills': json.loads(cv.skills) if cv.skills else [],
                'languages': json.loads(cv.languages) if cv.languages else [],
                'certifications': json.loads(cv.certifications) if cv.certifications else [],
                'projects': json.loads(cv.projects) if cv.projects else [],
                'references': json.loads(cv.references) if cv.references else [],
                'created_at': cv.created_at.isoformat() if cv.created_at else None,
                'updated_at': cv.updated_at.isoformat() if cv.updated_at else None
            }
            yield f"data: {json.dumps(initial_dict)}\n\n"
            
            # Listen for updates
            while True:
                try:
                    # Wait for update
                    updated_cv = await queue.get()
                    # Convert Strawberry object to dict
                    updated_dict = {
                        'id': updated_cv.id,
                        'user_id': updated_cv.user_id,
                        'full_name': updated_cv.full_name,
                        'email': updated_cv.email,
                        'phone': updated_cv.phone,
                        'address': updated_cv.address,
                        'linkedin': updated_cv.linkedin,
                        'github': updated_cv.github,
                        'website': updated_cv.website,
                        'summary': updated_cv.summary,
                        'experience': updated_cv.experience,
                        'education': updated_cv.education,
                        'skills': updated_cv.skills,
                        'languages': updated_cv.languages,
                        'certifications': updated_cv.certifications,
                        'projects': updated_cv.projects,
                        'references': updated_cv.references,
                        'created_at': updated_cv.created_at,
                        'updated_at': updated_cv.updated_at
                    }
                    yield f"data: {json.dumps(updated_dict)}\n\n"
                except Exception as e:
                    yield f"data: {{\"error\": \"{str(e)}\"}}\n\n"
                    break
        finally:
            # Clean up
            if user_id in cv_update_channels and queue in cv_update_channels[user_id]:
                cv_update_channels[user_id].remove(queue)
                if not cv_update_channels[user_id]:
                    del cv_update_channels[user_id]
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
        }
    )

@strawberry.type
class Subscription:
    @strawberry.subscription
    async def cv_updates(self, info: Info, cv_id: Optional[int] = None) -> AsyncGenerator[CV, None]:
        """Subscribe to CV updates for real-time synchronization"""
        if cv_id is None:
            raise Exception("cvId parameter is required")
        
        token = info.context.get("token")
        if not token:
            raise Exception("Not authenticated")
        
        username = get_current_user_from_token(token)
        if not username:
            raise Exception("Invalid token")
        
        # Get user and verify CV ownership
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
        
        # Create a queue for this subscription
        from asyncio import Queue
        queue = Queue()
        user_id = user.id
        
        if user_id not in cv_update_channels:
            cv_update_channels[user_id] = []
        cv_update_channels[user_id].append(queue)
        
        try:
            # Send initial CV data
            yield parse_cv_to_graphql(cv)
            
            # Listen for updates
            while True:
                try:
                    # Wait for update with timeout to keep connection alive
                    updated_cv = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield updated_cv
                except asyncio.TimeoutError:
                    # Send current CV data to keep connection alive
                    async with AsyncSessionLocal() as db:
                        current_cv = await CVService.get_cv(db, cv_id)
                        if current_cv:
                            yield parse_cv_to_graphql(current_cv)
        finally:
            # Clean up
            if user_id in cv_update_channels and queue in cv_update_channels[user_id]:
                cv_update_channels[user_id].remove(queue)
                if not cv_update_channels[user_id]:
                    del cv_update_channels[user_id]
