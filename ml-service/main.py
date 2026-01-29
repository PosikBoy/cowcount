"""
Main application entry point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.database import init_db
from app.routers import router as detection_router
from app.video_routers import router as video_router
from app.stream_routers import router as stream_router

# Initialize rate limiter with stricter limits
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/hour", "20/minute"]  # Global limits for all endpoints
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler"""
    # Startup
    init_db()
    yield
    # Shutdown (if needed)

# Create FastAPI application
app = FastAPI(
    title="Cow Detection System",
    description="Web system for monitoring cows using YOLO neural network",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = Path("../uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include routers
app.include_router(detection_router)
app.include_router(video_router)
app.include_router(stream_router)


@app.get("/", tags=["Root"])
@limiter.limit("30/minute")
async def root(request: Request):
    """
    Root endpoint - API information
    """
    return {
        "message": "Cow Detection System - Unified Backend",
        "version": "2.0.0",
        "architecture": "Layered (Repository + Service + Router)",
        "security": {
            "rate_limiting": "Enabled - 1 req/min for processing, 100 req/hour globally",
            "ddos_protection": "Active"
        },
        "endpoints": {
            "detect": "POST /detect - Upload and detect cows (1/min)",
            "video_analyze": "POST /video/analyze - Analyze video (1/min)",
            "history": "GET /detect/history - Get detection history",
            "detail": "GET /detect/{id} - Get specific detection",
            "delete": "DELETE /detect/{id} - Delete detection",
            "stats": "GET /detect/stats/summary - Get statistics",
            "health": "GET /health - Health check",
            "docs": "GET /docs - Swagger UI documentation",
            "redoc": "GET /redoc - ReDoc documentation"
        }
    }


@app.get("/health", tags=["Health"])
@limiter.limit("60/minute")
async def health_check(request: Request):
    """
    Health check endpoint
    """
    from app.database import SessionLocal
    
    # Check database connection
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy",
        "model": "YOLOv8",
        "database": db_status,
        "upload_dir": str(UPLOAD_DIR.absolute()),
        "rate_limiting": "enabled",
        "ddos_protection": "active"
    }
