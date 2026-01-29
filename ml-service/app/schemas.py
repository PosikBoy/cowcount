"""
Pydantic schemas for request/response validation (DTOs)
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class BoundingBox(BaseModel):
    """Bounding box coordinates"""
    x1: float
    y1: float
    x2: float
    y2: float


class Detection(BaseModel):
    """Single detection result"""
    class_name: str = "cow"
    confidence: float
    bbox: BoundingBox
    
    class Config:
        json_schema_extra = {
            "example": {
                "class_name": "cow",
                "confidence": 0.95,
                "bbox": {
                    "x1": 100.0,
                    "y1": 150.0,
                    "x2": 300.0,
                    "y2": 400.0
                }
            }
        }


class RecognitionResponse(BaseModel):
    """Response after detection"""
    id: int
    imagePath: str
    cowsCount: int
    result: List[dict]
    createdAt: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "imagePath": "1234567890.jpg",
                "cowsCount": 3,
                "result": [],
                "createdAt": "2026-01-29T12:00:00"
            }
        }


class RecognitionListItem(BaseModel):
    """Recognition item in list (short version)"""
    id: int
    imagePath: str
    cowsCount: int
    createdAt: str


class StatsResponse(BaseModel):
    """Statistics response"""
    totalDetections: int
    totalCows: int
    averageCowsPerImage: float


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    model: str
    database: str
    upload_dir: str


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
