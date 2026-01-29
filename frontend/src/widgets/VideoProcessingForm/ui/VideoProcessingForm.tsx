"use client";

import { VideoPlayer } from "@/entities/video/ui/VideoPlayer/VideoPlayer";
import { VideoUploader } from "@/features/upload-video/ui/VideoUploader/VideoUploader";
import { recognitionApi } from "@/shared/api/recognition.api";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useState } from "react";
import styles from "./VideoProcessingForm.module.scss";

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

interface VideoResult {
  video_filename: string;
  duration: number;
  fps: number;
  width: number;
  height: number;
  total_frames: number;
  analyzed_frames: number;
  total_cows_detected: number;
  max_cows_in_frame: number;
  average_cows_per_frame: number;
  detections_by_time: DetectionByTime[];
}

export const VideoProcessingForm = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 1000);

    try {
      const data = await recognitionApi.analyzeVideo(selectedFile, 1.0);
      setResult(data);
      setProgress(100);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || "Ошибка при анализе видео";
      setError(errorMessage);
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <Box className={styles.container}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Загрузка видео
          </Typography>

          <VideoUploader
            onFileSelect={handleFileSelect}
            onUpload={handleUpload}
            selectedFile={selectedFile}
            loading={loading}
            error={error}
          />

          {loading && (
            <Box className={styles.loadingSection}>
              <CircularProgress size={60} />
              <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                Анализ видео... Это может занять несколько минут
              </Typography>
              <Box sx={{ width: "100%", maxWidth: 400 }}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {progress}% завершено
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Результаты анализа
            </Typography>

            <Alert severity="success" sx={{ mb: 3 }}>
              Видео успешно проанализировано! Обнаружено коров:{" "}
              {result.total_cows_detected}
            </Alert>

            <Box className={styles.statsGrid}>
              <Box className={styles.statCard}>
                <Typography variant="h4" color="primary">
                  {result.total_cows_detected}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего коров
                </Typography>
              </Box>

              <Box className={styles.statCard}>
                <Typography variant="h4" color="primary">
                  {result.max_cows_in_frame}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Макс. в кадре
                </Typography>
              </Box>

              <Box className={styles.statCard}>
                <Typography variant="h4" color="primary">
                  {result.average_cows_per_frame.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Среднее на кадр
                </Typography>
              </Box>

              <Box className={styles.statCard}>
                <Typography variant="h4" color="primary">
                  {result.duration.toFixed(1)}с
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Длительность
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Видео с распознаванием
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Bounding boxes отрисовываются в реальном времени при
                воспроизведении
              </Typography>
              <VideoPlayer
                videoUrl={recognitionApi.getVideoUrl(result.video_filename)}
                detectionsByTime={result.detections_by_time}
                width={result.width}
                height={result.height}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Информация о видео
              </Typography>
              <Typography variant="body2">• FPS: {result.fps}</Typography>
              <Typography variant="body2">
                • Разрешение: {result.width}x{result.height}
              </Typography>
              <Typography variant="body2">
                • Всего кадров: {result.total_frames}
              </Typography>
              <Typography variant="body2">
                • Проанализировано кадров: {result.analyzed_frames}
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <button onClick={handleReset} className={styles.resetButton}>
                Загрузить новое видео
              </button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
