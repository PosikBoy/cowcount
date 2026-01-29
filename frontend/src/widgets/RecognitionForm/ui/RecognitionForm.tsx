"use client";

import { RecognitionImage } from "@/entities/recognition/ui/RecognitionImage/RecognitionImage";
import { CowSelector } from "@/features/select-cow/ui/CowSelector/CowSelector";
import { ImageUploader } from "@/features/upload-image/ui/ImageUploader/ImageUploader";
import { recognitionApi } from "@/shared/api/recognition.api";
import { DetectionResult } from "@/shared/types/recognition";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useState } from "react";
import styles from "./RecognitionForm.module.scss";

export const RecognitionForm = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [selectedCow, setSelectedCow] = useState<number | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
    setSelectedCow(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const data = await recognitionApi.uploadImage(selectedFile);
      setResult(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || "Ошибка при распознавании";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCowSelect = (index: number) => {
    setSelectedCow(selectedCow === index ? null : index);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setSelectedCow(null);
  };

  return (
    <Box className={styles.container}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Загрузка изображения
          </Typography>

          <ImageUploader
            onFileSelect={handleFileSelect}
            onUpload={handleUpload}
            selectedFile={selectedFile}
            loading={loading}
            error={error}
          />

          {loading && (
            <Box className={styles.loadingSection}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Распознавание...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Результат распознавания
            </Typography>

            <CowSelector
              detections={result.result}
              selectedCow={selectedCow}
              onCowSelect={handleCowSelect}
              totalCount={result.cowsCount}
            />

            <RecognitionImage
              imagePath={result.imagePath}
              detections={result.result}
              selectedCow={selectedCow}
            />

            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <button onClick={handleReset} className={styles.resetButton}>
                Загрузить новое изображение
              </button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
