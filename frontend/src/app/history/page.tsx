"use client";

import { HistoryList } from "@/entities/recognition/ui/HistoryList/HistoryList";
import { recognitionApi } from "@/shared/api/recognition.api";
import { Recognition } from "@/shared/types/recognition";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await recognitionApi.getHistory();
      setHistory(data);
      setError(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Ошибка при загрузке истории";
      setError(errorMessage);
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить это распознавание?")) {
      return;
    }

    setDeletingId(id);
    try {
      await recognitionApi.deleteById(id);
      setHistory(history.filter((item) => item.id !== id));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Ошибка при удалении";
      alert(errorMessage);
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (id: number) => {
    router.push(`/recognition/${id}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          История распознаваний
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Просмотр всех выполненных распознаваний коров
        </Typography>
      </Box>

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
            Загрузка истории...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button onClick={fetchHistory} sx={{ ml: 2 }}>
            Повторить
          </Button>
        </Alert>
      )}

      {!loading && !error && history.length === 0 && (
        <Alert severity="info">
          История распознаваний пуста. Загрузите первое изображение!
        </Alert>
      )}

      {!loading && !error && history.length > 0 && (
        <HistoryList
          items={history}
          onView={handleView}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}
    </Container>
  );
}
