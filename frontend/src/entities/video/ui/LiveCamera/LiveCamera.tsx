"use client";

import { API_ENDPOINTS, getWsUrl } from "@/shared/api/config";
import { Detection } from "@/shared/types/recognition";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import styles from "./LiveCamera.module.scss";

export const LiveCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentDetections, setCurrentDetections] = useState<Detection[]>([]);
  const [cowsCount, setCowsCount] = useState(0);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    return () => {
      stopCamera();
      disconnectWebSocket();
    };
  }, []);

  useEffect(() => {
    drawBoundingBoxes();
  }, [currentDetections]);

  const connectWebSocket = () => {
    const ws = new WebSocket(getWsUrl(API_ENDPOINTS.WS_VIDEO_STREAM));

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setError("");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "detection") {
          setCurrentDetections(data.detections || []);
          setCowsCount(data.cows_count || 0);
        } else if (data.type === "error") {
          console.error("Server error:", data.message);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Ошибка подключения к серверу");
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    wsRef.current = ws;
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);

        // Connect to WebSocket
        connectWebSocket();

        // Start sending frames
        sendFrames();
      }
    } catch (err) {
      setError(
        "Не удалось получить доступ к камере. Проверьте разрешения браузера.",
      );
      console.error("Camera access error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    disconnectWebSocket();
    setIsStreaming(false);
    setCurrentDetections([]);
    setCowsCount(0);
    setFps(0);
  };

  const sendFrames = () => {
    const video = videoRef.current;
    const ws = wsRef.current;

    if (!video || !ws || ws.readyState !== WebSocket.OPEN) {
      animationFrameRef.current = requestAnimationFrame(sendFrames);
      return;
    }

    // Create temporary canvas to capture frame
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext("2d");

    if (tempCtx) {
      // Draw current video frame
      tempCtx.drawImage(video, 0, 0);

      // Convert to base64
      const frameData = tempCanvas.toDataURL("image/jpeg", 0.7);

      // Send frame to server via WebSocket
      try {
        ws.send(
          JSON.stringify({
            type: "frame",
            data: frameData,
            timestamp: Date.now(),
          }),
        );
      } catch (err) {
        console.error("Error sending frame:", err);
      }
    }

    // Continue sending frames (approximately 10 FPS to avoid overload)
    setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(sendFrames);
    }, 100);
  };

  const drawBoundingBoxes = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scale factors
    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;

    // Draw bounding boxes
    currentDetections.forEach((detection, index) => {
      const { bbox, confidence } = detection;

      // Scale coordinates
      const x1 = bbox.x1 * scaleX;
      const y1 = bbox.y1 * scaleY;
      const x2 = bbox.x2 * scaleX;
      const y2 = bbox.y2 * scaleY;

      // Draw rectangle
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      // Draw label background
      const label = `Корова ${index + 1} (${(confidence * 100).toFixed(1)}%)`;
      ctx.font = "bold 16px Arial";
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = "#00ff00";
      ctx.fillRect(x1, y1 - 25, textWidth + 10, 25);

      // Draw label text
      ctx.fillStyle = "#000000";
      ctx.fillText(label, x1 + 5, y1 - 7);
    });
  };

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h6">Потоковое видео с камеры</Typography>
        <Box className={styles.stats}>
          <Typography variant="body2" color="text.secondary">
            Обнаружено коров: <strong>{cowsCount}</strong>
          </Typography>
          {isConnected && (
            <Typography variant="caption" sx={{ ml: 2, color: "success.main" }}>
              ● Подключено
            </Typography>
          )}
          {!isConnected && isStreaming && (
            <CircularProgress size={20} sx={{ ml: 2 }} />
          )}
        </Box>
      </Box>

      <Box className={styles.videoWrapper}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.video}
          onLoadedMetadata={() => {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            if (canvas && video) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }
          }}
        />
        <canvas ref={canvasRef} className={styles.canvas} />

        {!isStreaming && (
          <Box className={styles.placeholder}>
            <VideocamOffIcon sx={{ fontSize: 64, color: "text.secondary" }} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Камера не активна
            </Typography>
          </Box>
        )}
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Box className={styles.controls}>
        {!isStreaming ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<VideocamIcon />}
            onClick={startCamera}
            fullWidth
          >
            Включить камеру
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="error"
            size="large"
            startIcon={<VideocamOffIcon />}
            onClick={stopCamera}
            fullWidth
          >
            Выключить камеру
          </Button>
        )}
      </Box>

      <Box className={styles.info}>
        <Typography variant="body2" color="text.secondary">
          💡 Система обрабатывает видеопоток в реальном времени через WebSocket
          соединение (~10 FPS)
        </Typography>
      </Box>
    </Box>
  );
};
