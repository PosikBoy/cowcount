"""
Routers (Controllers) - handle HTTP requests
"""
from fastapi import APIRouter, Depends, File, UploadFile, Request
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
from slowapi import Limiter
from slowapi.util import get_remote_address

from .database import get_db
from .services import RecognitionService, YOLOService, FileService
from .schemas import (
    RecognitionResponse,
    RecognitionListItem,
    StatsResponse,
    HealthResponse,
    MessageResponse
)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize services (singletons)
yolo_service = YOLOService()
file_service = FileService(upload_dir=Path("../uploads"))

# Create router
router = APIRouter(prefix="/detect", tags=["Detection"])


def get_recognition_service(db: Session = Depends(get_db)) -> RecognitionService:
    """Dependency injection for RecognitionService"""
    return RecognitionService(db, yolo_service, file_service)


@router.post("", response_model=RecognitionResponse, status_code=201)
@limiter.limit("10/minute")
async def detect_cows(
    request: Request,
    file: UploadFile = File(...),
    service: RecognitionService = Depends(get_recognition_service)
):
    """
    Upload an image and detect cows using YOLO
    
    - **file**: Image file (JPG or PNG, max 5MB)
    - **Rate limit**: 10 requests per minute per IP address
    
    Returns detection results with cow count and bounding boxes
    """
    recognition = await service.detect_and_save(file)
    return recognition.to_dict()


@router.get("/history", response_model=List[RecognitionListItem])
async def get_history(
    skip: int = 0,
    limit: int = 100,
    service: RecognitionService = Depends(get_recognition_service)
):
    """
    Get detection history
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    
    Returns list of all detections, sorted by date (newest first)
    """
    recognitions = service.get_history(skip=skip, limit=limit)
    return [rec.to_dict_short() for rec in recognitions]


@router.get("/{recognition_id}", response_model=RecognitionResponse)
async def get_recognition(
    recognition_id: int,
    service: RecognitionService = Depends(get_recognition_service)
):
    """
    Get specific recognition by ID
    
    - **recognition_id**: Recognition ID
    
    Returns full detection details including bounding boxes
    """
    recognition = service.get_by_id(recognition_id)
    return recognition.to_dict()


@router.delete("/{recognition_id}", response_model=MessageResponse)
async def delete_recognition(
    recognition_id: int,
    service: RecognitionService = Depends(get_recognition_service)
):
    """
    Delete recognition and its associated image
    
    - **recognition_id**: Recognition ID
    """
    service.delete(recognition_id)
    return {"message": "Recognition deleted successfully"}


@router.get("/stats/summary", response_model=StatsResponse)
async def get_stats(
    service: RecognitionService = Depends(get_recognition_service)
):
    """
    Get statistics about detections
    
    Returns total detections, total cows, and average cows per image
    """
    return service.get_stats()
