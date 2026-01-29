"""
Service layer - contains business logic
"""
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from PIL import Image
from ultralytics import YOLO
from pathlib import Path
from datetime import datetime
from typing import List, Tuple
import io
import os

# Register AVIF plugin if available
try:
    import pillow_avif
except ImportError:
    pass  # AVIF support is optional

from .repositories import RecognitionRepository
from .models import Recognition


class YOLOService:
    """
    Service for YOLO model operations
    """
    
    def __init__(self):
        # Fix for PyTorch 2.6+ weights_only issue
        # Temporarily patch torch.load to use weights_only=False for YOLO
        import torch
        original_load = torch.load
        
        def patched_load(*args, **kwargs):
            kwargs['weights_only'] = False
            return original_load(*args, **kwargs)
        
        torch.load = patched_load
        self.model = YOLO("yolov8n.pt")
        torch.load = original_load  # Restore original
    
    def detect_cows(self, image: Image.Image) -> Tuple[List[dict], int]:
        """
        Detect cows in image using YOLO
        Returns: (detections, cows_count)
        """
        # Run YOLO detection
        results = self.model(image)
        
        # Process results
        detections = []
        cows_count = 0
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get class name
                class_id = int(box.cls[0])
                class_name = self.model.names[class_id]
                
                # Filter for cows (class 19 in COCO dataset is 'cow')
                if class_name.lower() == 'cow':
                    confidence = float(box.conf[0])
                    bbox = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                    
                    detections.append({
                        "class": class_name,
                        "confidence": confidence,
                        "bbox": {
                            "x1": bbox[0],
                            "y1": bbox[1],
                            "x2": bbox[2],
                            "y2": bbox[3]
                        }
                    })
                    cows_count += 1
        
        return detections, cows_count


class FileService:
    """
    Service for file operations
    """
    
    def __init__(self, upload_dir: Path):
        self.upload_dir = upload_dir
        self.upload_dir.mkdir(exist_ok=True)
    
    def validate_file(self, file: UploadFile) -> None:
        """Validate uploaded file"""
        # Supported image formats
        SUPPORTED_EXTENSIONS = [
            '.jpg', '.jpeg', '.png',  # Common formats
            '.webp',                   # Modern format (supported by Pillow 10+)
            '.bmp', '.gif',            # Legacy formats
            '.tiff', '.tif'            # Professional formats
        ]
        # Note: AVIF requires additional system libraries and is not included
        
        # Check content type (more flexible check)
        if file.content_type and not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.content_type}. Only images are supported."
            )
        
        # Check file extension
        if file.filename:
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in SUPPORTED_EXTENSIONS:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file extension: {ext}. Supported formats: {', '.join(SUPPORTED_EXTENSIONS)}"
                )
    
    async def save_file(self, file: UploadFile) -> Tuple[str, bytes]:
        """
        Save uploaded file
        Returns: (filename, file_contents)
        """
        # Read file contents
        contents = await file.read()
        
        # Validate file size (20MB max)
        if len(contents) > 20 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File size exceeds 20MB limit."
            )
        
        # Generate unique filename
        timestamp = int(datetime.now().timestamp() * 1000)
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"{timestamp}{file_extension}"
        file_path = self.upload_dir / filename
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(contents)
        
        return filename, contents
    
    def delete_file(self, filename: str) -> bool:
        """Delete file from uploads directory"""
        file_path = self.upload_dir / filename
        if file_path.exists():
            file_path.unlink()
            return True
        return False
    
    def load_image(self, contents: bytes) -> Image.Image:
        """Load image from bytes"""
        try:
            image = Image.open(io.BytesIO(contents))
            
            # Convert to RGB if necessary
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            return image
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot open image file. The file may be corrupted or in an unsupported format. Error: {str(e)}"
            )


class RecognitionService:
    """
    Service for recognition operations
    Orchestrates YOLO, File, and Repository services
    """
    
    def __init__(
        self,
        db: Session,
        yolo_service: YOLOService,
        file_service: FileService
    ):
        self.repository = RecognitionRepository(db)
        self.yolo_service = yolo_service
        self.file_service = file_service
    
    async def detect_and_save(self, file: UploadFile) -> Recognition:
        """
        Main business logic: detect cows and save results
        """
        try:
            # Validate file
            self.file_service.validate_file(file)
            
            # Save file
            filename, contents = await self.file_service.save_file(file)
            
            # Load image
            image = self.file_service.load_image(contents)
            
            # Detect cows
            detections, cows_count = self.yolo_service.detect_cows(image)
            
            # Save to database
            recognition = self.repository.create(
                image_path=filename,
                result=detections,
                cows_count=cows_count
            )
            
            return recognition
            
        except HTTPException:
            raise
        except Exception as e:
            # Clean up file if error occurs
            if 'filename' in locals():
                self.file_service.delete_file(filename)
            raise HTTPException(
                status_code=500,
                detail=f"Error processing image: {str(e)}"
            )
    
    def get_history(self, skip: int = 0, limit: int = 100) -> List[Recognition]:
        """Get recognition history"""
        return self.repository.get_all(skip=skip, limit=limit)
    
    def get_by_id(self, recognition_id: int) -> Recognition:
        """Get recognition by ID"""
        recognition = self.repository.get_by_id(recognition_id)
        if not recognition:
            raise HTTPException(status_code=404, detail="Recognition not found")
        return recognition
    
    def delete(self, recognition_id: int) -> None:
        """Delete recognition and its file"""
        recognition = self.get_by_id(recognition_id)
        
        # Delete file
        self.file_service.delete_file(recognition.image_path)
        
        # Delete from database
        self.repository.delete(recognition_id)
    
    def get_stats(self) -> dict:
        """Get statistics"""
        total_detections = self.repository.count()
        total_cows = self.repository.sum_cows()
        avg_cows = total_cows / total_detections if total_detections > 0 else 0
        
        return {
            "totalDetections": total_detections,
            "totalCows": total_cows,
            "averageCowsPerImage": round(avg_cows, 2)
        }
