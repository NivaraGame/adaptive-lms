from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.db.session import engine
from app.models import Base
from app.api.routes import dialogs, messages, users, content, recommendations, metrics, user_profiles, experiments


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown events
    """
    # Startup
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # Create tables (in production, use Alembic migrations)
    # Base.metadata.create_all(bind=engine)

    yield

    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Adaptive Learning Management System with AI-powered personalization",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(user_profiles.router, prefix="/api/v1/profiles", tags=["user-profiles"])
app.include_router(dialogs.router, prefix="/api/v1/dialogs", tags=["dialogs"])
app.include_router(messages.router, prefix="/api/v1/messages", tags=["messages"])
app.include_router(content.router, prefix="/api/v1/content", tags=["content"])
app.include_router(metrics.router, prefix="/api/v1/metrics", tags=["metrics"])
app.include_router(experiments.router, prefix="/api/v1/experiments", tags=["experiments"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["recommendations"])


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
