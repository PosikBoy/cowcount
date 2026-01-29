"use client";

import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Box, IconButton, Slider, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import styles from "./VideoPlayer.module.scss";

interface Detection {
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

interface DetectionByTime {
  timestamp: number;
  frame_number: number;
  cows_count: number;
  detections: Detection[];
}

interface VideoPlayerProps {
  videoUrl: string;
  detectionsByTime: DetectionByTime[];
  width: number;
  height: number;
}

export const VideoPlayer = ({
  videoUrl,
  detectionsByTime,
  width,
  height,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentDetections, setCurrentDetections] = useState<Detection[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      if (!isSeeking) {
        setSliderValue(time);
      }

      const detection = detectionsByTime.find(
        (d) => Math.abs(d.timestamp - time) < 0.5,
      );

      if (detection) {
        setCurrentDetections(detection.detections);
      }
    };

    const handleLoadedMetadata = () => {
      const dur = video.duration;
      if (dur && !isNaN(dur) && isFinite(dur)) {
        setDuration(dur);
        setSliderValue(0);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [detectionsByTime, isSeeking]);

  useEffect(() => {
    drawBoundingBoxes();
  }, [currentDetections]);

  useEffect(() => {
    const handleResize = () => {
      updateCanvasSize();
      drawBoundingBoxes();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentDetections]);

  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
  };

  const drawBoundingBoxes = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = video.clientWidth / width;
    const scaleY = video.clientHeight / height;

    currentDetections.forEach((detection, index) => {
      const { bbox, confidence } = detection;

      const x1 = bbox.x1 * scaleX;
      const y1 = bbox.y1 * scaleY;
      const x2 = bbox.x2 * scaleX;
      const y2 = bbox.y2 * scaleY;

      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      const label = `Корова ${index + 1} (${(confidence * 100).toFixed(1)}%)`;
      ctx.font = "bold 16px Arial";
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = "#00ff00";
      ctx.fillRect(x1, y1 - 25, textWidth + 10, 25);

      ctx.fillStyle = "#000000";
      ctx.fillText(label, x1 + 5, y1 - 7);
    });
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSliderChange = (
    _event: Event | React.SyntheticEvent,
    value: number | number[],
  ) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setSliderValue(newValue);
    setIsSeeking(true);
  };

  const handleSeekCommitted = (
    _event: Event | React.SyntheticEvent,
    value: number | number[],
  ) => {
    const video = videoRef.current;
    if (!video) {
      setIsSeeking(false);
      return;
    }

    const newTime = Array.isArray(value) ? value[0] : value;

    if (
      video.readyState >= 2 &&
      video.seekable.length > 0 &&
      newTime >= video.seekable.start(0) &&
      newTime <= video.seekable.end(0)
    ) {
      video.currentTime = newTime;
      setCurrentTime(newTime);
      setSliderValue(newTime);
    }

    setTimeout(() => {
      setIsSeeking(false);
    }, 300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box className={styles.container}>
      <Box className={styles.videoWrapper}>
        <video
          ref={videoRef}
          src={videoUrl}
          className={styles.video}
          preload="metadata"
          crossOrigin="anonymous"
          onLoadedMetadata={() => {
            updateCanvasSize();
            drawBoundingBoxes();
          }}
          onResize={updateCanvasSize}
        />
        <canvas ref={canvasRef} className={styles.canvas} />
      </Box>

      <Box className={styles.controls}>
        <IconButton onClick={togglePlayPause} color="primary" size="large">
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>

        <Typography variant="body2" sx={{ minWidth: "50px" }}>
          {formatTime(currentTime)}
        </Typography>

        <Slider
          value={sliderValue}
          max={duration}
          onChange={handleSliderChange}
          onChangeCommitted={handleSeekCommitted}
          sx={{ flex: 1, mx: 2 }}
          marks={detectionsByTime.map((d) => ({
            value: d.timestamp,
            label: "",
          }))}
        />

        <Typography variant="body2" sx={{ minWidth: "50px" }}>
          {formatTime(duration)}
        </Typography>
      </Box>
    </Box>
  );
};
