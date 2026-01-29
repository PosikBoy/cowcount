"use client";

import { RecognitionDetail } from "@/entities/recognition/ui/RecognitionDetail";
import { recognitionApi } from "@/shared/api/recognition.api";
import { Recognition } from "@/shared/types/recognition";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RecognitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recognition, setRecognition] = useState<Recognition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecognition();
  }, [params.id]);

  const fetchRecognition = async () => {
    try {
      setLoading(true);
      const data = await recognitionApi.getById(params.id as string);
      setRecognition(data);
      setError(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Ошибка при загрузке данных";
      setError(errorMessage);
      console.error("Recognition fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить это распознавание?")) {
      return;
    }

    try {
      await recognitionApi.deleteById(params.id as string);
      router.push("/history");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Ошибка при удалении";
      alert(errorMessage);
      console.error("Delete error:", err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 8,
          }}
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Загрузка...
          </Typography>
        </Box>
      )}

      {error && (
        <>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/history")}
          >
            Вернуться назад
          </Button>
        </>
      )}

      {!loading && !error && recognition && (
        <>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/history")}
            >
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

          <RecognitionDetail recognition={recognition} />
        </>
      )}
    </Container>
  );
}
