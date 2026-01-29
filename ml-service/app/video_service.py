"""
Video processing service for cow detection
"""
import cv2
from pathlib import Path
from typing import List, Tuple, Dict
from fastapi import HTTPException, UploadFile
from datetime import datetime
import os
import logging

from .services import YOLOService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VideoService:
    """
    Service for video processing operations
    """
    
    def __init__(self, upload_dir: Path, yolo_service: YOLOService):
        self.upload_dir = upload_dir
        self.upload_dir.mkdir(exist_ok=True)
        self.yolo_service = yolo_service
    
    def validate_video(self, file: UploadFile) -> None:
        """Validate uploaded video file"""
        SUPPORTED_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
        
        # Check content type
        if file.content_type and not file.content_type.startswith("video/"):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.content_type}. Only videos are supported."
            )
        
        # Check file extension
        if file.filename:
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in SUPPORTED_EXTENSIONS:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file extension: {ext}. Supported formats: {', '.join(SUPPORTED_EXTENSIONS)}"
                )
    
    async def save_video(self, file: UploadFile) -> Tuple[str, str]:
        """
        Save uploaded video
        Returns: (filename, file_path)
        """
        # Read file contents
        contents = await file.read()
        
        # Validate file size (200MB max for videos)
        if len(contents) > 200 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Video file size exceeds 200MB limit."
            )
        
        # Generate unique filename
        timestamp = int(datetime.now().timestamp() * 1000)
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"{timestamp}{file_extension}"
        file_path = self.upload_dir / filename
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(contents)
        
        return filename, str(file_path)
    
    def analyze_video(self, video_path: str, sample_interval: float = 0.1) -> Dict:
        """
        Analyze video: extract frames at intervals and detect cows
        Returns only detection data, no video rendering
        
        Args:
            video_path: Path to input video
            sample_interval: Analyze frames every N seconds (default: 1.0 second)
        
        Returns:
            Dictionary with analysis results and detection data per timestamp
        """
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Cannot open video file")
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        
        # Check duration limit (10 minutes = 600 seconds)
        MAX_DURATION = 600  # 10 minutes
        if duration > MAX_DURATION:
            cap.release()
            duration_minutes = int(duration // 60)
            duration_seconds = int(duration % 60)
            raise HTTPException(
                status_code=400,
                detail=f"Video duration ({duration_minutes}:{duration_seconds:02d}) exceeds maximum allowed duration of 10 minutes."
            )
        
        # Log video information
        video_filename = os.path.basename(video_path)
        duration_minutes = int(duration // 60)
        duration_seconds = int(duration % 60)
        logger.info(f"Starting video analysis: {video_filename}")
        logger.info(f"Video duration: {duration_minutes:02d}:{duration_seconds:02d}, FPS: {fps}, Resolution: {width}x{height}")
        logger.info(f"Processing frames every {sample_interval} second(s)")
        
        # Analyze frames
        frame_count = 0
        analyzed_count = 0
        total_cows_detected = 0
        max_cows_in_frame = 0
        detections_by_time = []
        last_processed_time = -sample_interval  # Process first frame
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_count += 1
                current_time = frame_count / fps
                
                # Process frame if enough time has passed since last processing
                if current_time - last_processed_time >= sample_interval:
                    last_processed_time = current_time
                    
                    # Convert BGR to RGB for YOLO
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    
                    # Run YOLO detection
                    results = self.yolo_service.model(rgb_frame)
                    
                    # Collect detections for this timestamp
                    frame_detections = []
                    cows_in_frame = 0
                    
                    for result in results:
                        boxes = result.boxes
                        for box in boxes:
                            class_id = int(box.cls[0])
                            class_name = self.yolo_service.model.names[class_id]
                            
                            if class_name.lower() == 'cow':
                                cows_in_frame += 1
                                confidence = float(box.conf[0])
                                x1, y1, x2, y2 = map(float, box.xyxy[0].tolist())
                                
                                frame_detections.append({
                                    "confidence": confidence,
                                    "bbox": {
                                        "x1": x1,
                                        "y1": y1,
                                        "x2": x2,
                                        "y2": y2
                                    }
                                })
                    
                    total_cows_detected += cows_in_frame
                    max_cows_in_frame = max(max_cows_in_frame, cows_in_frame)
                    analyzed_count += 1
                    
                    # Log progress with timestamp in MM:SS format
                    current_minutes = int(current_time // 60)
                    current_seconds = int(current_time % 60)
                    logger.info(f"Processing {current_minutes:02d}:{current_seconds:02d} - detected {cows_in_frame} cow(s)")
                    
                    detections_by_time.append({
                        "timestamp": round(current_time, 2),
                        "frame_number": frame_count,
                        "cows_count": cows_in_frame,
                        "detections": frame_detections
                    })
            
        finally:
            cap.release()
        
        avg_cows = total_cows_detected / analyzed_count if analyzed_count > 0 else 0
        
        # Log completion summary
        logger.info(f"Analysis complete: {analyzed_count} frames processed")
        logger.info(f"Total cows detected: {total_cows_detected}, Max in frame: {max_cows_in_frame}, Average: {avg_cows:.2f}")
        
        return {
            "video_filename": os.path.basename(video_path),
            "duration": round(duration, 2),
            "fps": fps,
            "width": width,
            "height": height,
            "total_frames": total_frames,
            "analyzed_frames": analyzed_count,
            "total_cows_detected": total_cows_detected,
            "max_cows_in_frame": max_cows_in_frame,
            "average_cows_per_frame": round(avg_cows, 2),
            "detections_by_time": detections_by_time
        }
    
    def delete_video(self, filename: str) -> bool:
        """Delete video file"""
        file_path = self.upload_dir / filename
        if file_path.exists():
            file_path.unlink()
            return True
        return False
