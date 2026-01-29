"use client";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import styles from "./Recognition.module.scss";

interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Detection {
  class: string;
  confidence: number;
  bbox: BoundingBox;
}

interface DetectionResult {
  id: number;
  imagePath: string;
  cowsCount: number;
  result: Detection[];
}

export default function Recognition() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedCow, setSelectedCow] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageLoaded && result) {
      drawBoundingBoxes();
    }
  }, [imageLoaded, result, selectedCow]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      setImageLoaded(false);
      setSelectedCow(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post<DetectionResult>(
        "http://localhost:9000/detect",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setResult(response.data);
      setImageLoaded(false);
      setSelectedCow(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Ошибка при распознавании";
      setError(errorMessage);
      console.error("Recognition error:", err);
    } finally {
      setLoading(false);
    }
  };

  const drawBoundingBoxes = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!canvas || !image || !result) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Draw image
    ctx.drawImage(image, 0, 0);

    // Draw bounding boxes
    result.result.forEach((detection, index) => {
      const { bbox, confidence } = detection;

      // Skip if a cow is selected and this is not it
      if (selectedCow !== null && selectedCow !== index) {
        return;
      }

      // Draw rectangle
      ctx.strokeStyle = selectedCow === index ? "#ff5722" : "#1976d2";
      ctx.lineWidth = selectedCow === index ? 6 : 4;
      ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);

      // Draw label background
      const label = `Корова ${index + 1} (${(confidence * 100).toFixed(1)}%)`;
      ctx.font = "bold 20px Arial";
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = selectedCow === index ? "#ff5722" : "#1976d2";
      ctx.fillRect(bbox.x1, bbox.y1 - 30, textWidth + 20, 30);

      // Draw label text
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, bbox.x1 + 10, bbox.y1 - 8);
    });
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleCowClick = (index: number) => {
    setSelectedCow(selectedCow === index ? null : index);
  };

  return (
    <Box className={styles.container}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Загрузить изображение
          </Typography>

          <Box className={styles.uploadSection}>
            <input
              accept="image/jpeg,image/png,image/jpg,image/webp,image/bmp,image/gif,image/tiff"
              style={{ display: "none" }}
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                size="large"
              >
                Выбрать файл
              </Button>
            </label>

            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Выбран файл: {selectedFile.name}
              </Typography>
            )}
          </Box>

          {preview && !result && (
            <Box className={styles.previewSection}>
              <img src={preview} alt="Preview" className={styles.preview} />
            </Box>
          )}

          {selectedFile && !loading && !result && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              fullWidth
              size="large"
              sx={{ mt: 2 }}
            >
              Распознать коров
            </Button>
          )}

          {loading && (
            <Box className={styles.loadingSection}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Обработка изображения...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Результат распознавания
            </Typography>

            <Typography variant="h6" color="primary" gutterBottom>
              Обнаружено коров: {result.cowsCount}
            </Typography>

            {result.cowsCount > 0 && (
              <>
                <Box sx={{ mb: 2 }}>
                  {result.result.map((detection, index) => (
                    <Chip
                      key={index}
                      label={`Корова ${index + 1}: ${(detection.confidence * 100).toFixed(1)}%`}
                      color={selectedCow === index ? "error" : "primary"}
                      variant={selectedCow === index ? "filled" : "outlined"}
                      onClick={() => handleCowClick(index)}
                      sx={{ mr: 1, mb: 1, cursor: "pointer" }}
                    />
                  ))}
                </Box>

                <Box className={styles.imageWithBoxes}>
                  <img
                    ref={imageRef}
                    src={`http://localhost:9000/uploads/${result.imagePath}`}
                    alt="Result"
                    className={styles.hiddenImage}
                    onLoad={handleImageLoad}
                    crossOrigin="anonymous"
                  />
                  <canvas ref={canvasRef} className={styles.canvas} />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, mb: 2 }}
                >
                  💡 Нажмите на квадратик или chip, чтобы выделить конкретную
                  корову
                </Typography>

                <Box className={styles.cowsGrid} sx={{ mt: 2 }}>
                  {Array.from({ length: result.cowsCount }).map((_, i) => (
                    <Tooltip
                      key={i}
                      title={`Корова ${i + 1} - нажмите для выделения`}
                      arrow
                    >
                      <Box
                        className={`${styles.cowSquare} ${selectedCow === i ? styles.cowSquareSelected : ""}`}
                        onClick={() => handleCowClick(i)}
                      >
                        {i + 1}
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </>
            )}

            {result.cowsCount === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                На изображении не обнаружено коров
              </Alert>
            )}

            <Button
              variant="outlined"
              onClick={() => {
                setResult(null);
                setSelectedFile(null);
                setPreview(null);
                setSelectedCow(null);
              }}
              fullWidth
              sx={{ mt: 2 }}
            >
              Загрузить другое изображение
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
