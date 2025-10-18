from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from database import sync_engine
from models import Base
from routers import auth, cv
from gql.schema import graphql_app
from gql.resolvers import cv_updates_sse

# Create tables using sync engine
Base.metadata.create_all(bind=sync_engine)

app = FastAPI(title="Rolekits", description="Role Management System with GraphQL")

app.mount("/static", StaticFiles(directory="static"), name="static")

# REST API routes (for templates and basic auth)
app.include_router(auth.router)
app.include_router(cv.router)

# GraphQL endpoint
app.include_router(graphql_app, prefix="/graphql")

# Server-Sent Events endpoint for real-time CV updates
@app.get("/cv-updates/{cv_id}")
async def cv_updates_endpoint(cv_id: int, request: Request):
    return await cv_updates_sse(cv_id, request)
