"""
Video processing routers
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from pathlib import Path
from typing import Dict
from slowapi import Limiter
from slowapi.util import get_remote_address
import os

from .video_service import VideoService
from .services import YOLOService

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize services
yolo_service = YOLOService()
video_service = VideoService(upload_dir=Path("../uploads"), yolo_service=yolo_service)

# Create router
router = APIRouter(prefix="/video", tags=["Video Processing"])


@router.post("/analyze", response_model=Dict, status_code=201)
@limiter.limit("5/minute")
async def analyze_video(
    request: Request,
    file: UploadFile = File(...),
    sample_interval: float = 1.0
):
    """
    Upload and analyze a video to detect cows
    
    - **file**: Video file (MP4, AVI, MOV, max 200MB, max 10 minutes duration)
    - **sample_interval**: Analyze frames every N seconds (default: 1.0 second)
    - **Rate limit**: 5 requests per minute per IP address
    
    Returns analysis results with detection data for each timestamp.
    Video is saved for playback but no processed video is created.
    """
    try:
        # Validate video
        video_service.validate_video(file)
        
        # Save video
        filename, video_path = await video_service.save_video(file)
        
        # Analyze video (no rendering, just detection data)
        result = video_service.analyze_video(video_path, sample_interval=sample_interval)
        
        return {
            **result,
            "video_filename": filename,
            "message": "Video analyzed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing video: {str(e)}"
        )


@router.get("/stream/{filename}")
async def stream_video(filename: str, request: Request):
    """
    Stream original video file with Range request support for seeking
    
    - **filename**: Name of the video file
    """
    file_path = Path("../uploads") / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found")
    
    file_size = os.path.getsize(file_path)
    range_header = request.headers.get("range")
    
    if range_header:
        # Parse range header
        range_match = range_header.replace("bytes=", "").split("-")
        start = int(range_match[0]) if range_match[0] else 0
        end = int(range_match[1]) if range_match[1] else file_size - 1
        
        # Ensure valid range
        start = max(0, start)
        end = min(end, file_size - 1)
        content_length = end - start + 1
        
        def iter_file():
            with open(file_path, "rb") as f:
                f.seek(start)
                remaining = content_length
                while remaining > 0:
                    chunk_size = min(8192, remaining)
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                    remaining -= len(chunk)
                    yield chunk
        
        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(content_length),
            "Content-Type": "video/mp4",
        }
        
        return StreamingResponse(
            iter_file(),
            status_code=206,
            headers=headers,
            media_type="video/mp4"
        )
    else:
        # No range header, return full file
        def iter_full_file():
            with open(file_path, "rb") as f:
                while chunk := f.read(8192):
                    yield chunk
        
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
            "Content-Type": "video/mp4",
        }
        
        return StreamingResponse(
            iter_full_file(),
            headers=headers,
            media_type="video/mp4"
        )


@router.delete("/{filename}")
async def delete_video(filename: str):
    """
    Delete video file
    
    - **filename**: Name of the video file to delete
    """
    success = video_service.delete_video(filename)
    
    if not success:
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return {"message": "Video deleted successfully"}
