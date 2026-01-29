"""
WebSocket router for real-time video stream processing
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
import cv2
import numpy as np
import base64
import json
import logging

from .services import YOLOService

logger = logging.getLogger(__name__)

# Initialize services
yolo_service = YOLOService()

# Create router
router = APIRouter(prefix="/stream", tags=["Video Stream"])


@router.websocket("/video")
async def video_stream(websocket: WebSocket):
    """
    WebSocket endpoint for real-time video stream processing
    
    Client sends base64 encoded video frames
    Server responds with detection results in real-time
    """
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    frame_count = 0
    
    try:
        while True:
            # Receive frame data from client
            data = await websocket.receive_text()
            
            try:
                # Parse incoming data
                message = json.loads(data)
                
                if message.get("type") == "frame":
                    frame_count += 1
                    
                    # Decode base64 image
                    frame_data = message.get("data", "")
                    if not frame_data:
                        continue
                    
                    # Remove data URL prefix if present
                    if "base64," in frame_data:
                        frame_data = frame_data.split("base64,")[1]
                    
                    # Decode base64 to bytes
                    img_bytes = base64.b64decode(frame_data)
                    
                    # Convert to numpy array
                    nparr = np.frombuffer(img_bytes, np.uint8)
                    
                    # Decode image
                    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    
                    if frame is None:
                        await websocket.send_json({
                            "type": "error",
                            "message": "Failed to decode frame"
                        })
                        continue
                    
                    # Convert BGR to RGB for YOLO
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    
                    # Run YOLO detection
                    results = yolo_service.model(rgb_frame)
                    
                    # Collect detections
                    detections = []
                    cows_count = 0
                    
                    for result in results:
                        boxes = result.boxes
                        for box in boxes:
                            class_id = int(box.cls[0])
                            class_name = yolo_service.model.names[class_id]
                            
                            if class_name.lower() == 'cow':
                                cows_count += 1
                                confidence = float(box.conf[0])
                                x1, y1, x2, y2 = map(float, box.xyxy[0].tolist())
                                
                                detections.append({
                                    "confidence": confidence,
                                    "bbox": {
                                        "x1": x1,
                                        "y1": y1,
                                        "x2": x2,
                                        "y2": y2
                                    }
                                })
                    
                    # Send detection results back to client
                    response = {
                        "type": "detection",
                        "frame_number": frame_count,
                        "cows_count": cows_count,
                        "detections": detections,
                        "timestamp": message.get("timestamp", 0)
                    }
                    
                    await websocket.send_json(response)
                    
                    # Log every 30 frames
                    if frame_count % 30 == 0:
                        logger.info(f"Processed {frame_count} frames, detected {cows_count} cows in last frame")
                
                elif message.get("type") == "ping":
                    # Respond to ping to keep connection alive
                    await websocket.send_json({"type": "pong"})
                
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format"
                })
            except Exception as e:
                logger.error(f"Error processing frame: {str(e)}")
                await websocket.send_json({
                    "type": "error",
                    "message": f"Processing error: {str(e)}"
                })
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected. Processed {frame_count} frames total")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.close()
        except:
            pass
