"use client";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";

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

interface RecognitionDetail {
  id: number;
  imagePath: string;
  cowsCount: number;
  result: Detection[];
  createdAt: string;
}

export default function RecognitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recognition, setRecognition] = useState<RecognitionDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedCow, setSelectedCow] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    fetchRecognition();
  }, [params.id]);

  useEffect(() => {
    if (imageLoaded && recognition) {
      drawBoundingBoxes();
    }
  }, [imageLoaded, recognition, selectedCow]);

  const fetchRecognition = async () => {
    try {
      const response = await axios.get<RecognitionDetail>(
        `http://localhost:9000/detect/${params.id}`,
      );
      setRecognition(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить это распознавание?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:9000/detect/${params.id}`);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка при удалении");
    }
  };

  const drawBoundingBoxes = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!canvas || !image || !recognition) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Draw image
    ctx.drawImage(image, 0, 0);

    // Draw bounding boxes
    recognition.result.forEach((detection, index) => {
      // Skip non-selected cows if one is selected
      if (selectedCow !== null && selectedCow !== index) {
        return;
      }

      const { bbox, confidence } = detection;
      const isSelected = selectedCow === index;

      // Draw rectangle with different style for selected cow
      ctx.strokeStyle = isSelected ? "#ff5722" : "#1976d2";
      ctx.lineWidth = isSelected ? 6 : 4;
      ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);

      // Draw label background
      const label = `Корова ${index + 1} (${(confidence * 100).toFixed(1)}%)`;
      ctx.font = "bold 20px Arial";
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = isSelected ? "#ff5722" : "#1976d2";
      ctx.fillRect(bbox.x1, bbox.y1 - 30, textWidth + 20, 30);

      // Draw label text
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, bbox.x1 + 10, bbox.y1 - 8);
    });
  };

  const handleCowClick = (index: number) => {
    setSelectedCow(selectedCow === index ? null : index);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box className={styles.loadingSection}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Загрузка...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !recognition) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || "Распознавание не найдено"}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/")}
          sx={{ mt: 2 }}
        >
          Вернуться назад
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/")}>
          Назад к списку
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          Удалить
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Распознавание #{recognition.id}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {formatDate(recognition.createdAt)}
          </Typography>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Chip
              label={`Обнаружено коров: ${recognition.cowsCount}`}
              color="primary"
              sx={{ mr: 1, mb: 1 }}
            />
            {recognition.result.map((detection, index) => (
              <Chip
                key={index}
                label={`Корова ${index + 1}: ${(detection.confidence * 100).toFixed(1)}%`}
                variant={selectedCow === index ? "filled" : "outlined"}
                color={selectedCow === index ? "error" : "default"}
                onClick={() => handleCowClick(index)}
                sx={{ mr: 1, mb: 1, cursor: "pointer" }}
              />
            ))}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            💡 Нажмите на chip коровы, чтобы выделить её на изображении
          </Typography>

          <Box className={styles.imageContainer}>
            <img
              ref={imageRef}
              src={`http://localhost:9000/uploads/${recognition.imagePath}`}
              alt="Recognition"
              className={styles.hiddenImage}
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />
            <canvas ref={canvasRef} className={styles.canvas} />
          </Box>

          {recognition.result.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Детали распознавания:
              </Typography>
              {recognition.result.map((detection, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  onClick={() => handleCowClick(index)}
                  sx={{
                    mb: 2,
                    p: 2,
                    cursor: "pointer",
                    border:
                      selectedCow === index ? "2px solid #ff5722" : undefined,
                    backgroundColor:
                      selectedCow === index
                        ? "rgba(255, 87, 34, 0.05)"
                        : undefined,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.05)",
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                    },
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    Корова {index + 1}
                  </Typography>
                  <Typography variant="body2">
                    Уверенность: {(detection.confidence * 100).toFixed(2)}%
                  </Typography>
                  <Typography variant="body2">
                    Координаты: ({detection.bbox.x1.toFixed(0)},{" "}
                    {detection.bbox.y1.toFixed(0)}) - (
                    {detection.bbox.x2.toFixed(0)},{" "}
                    {detection.bbox.y2.toFixed(0)})
                  </Typography>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
