"use client";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./History.module.scss";

interface HistoryItem {
  id: number;
  imagePath: string;
  cowsCount: number;
  createdAt: string;
}

export default function History() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get<HistoryItem[]>(
        "http://localhost:9000/detect/history",
      );
      setHistory(response.data);
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

  const handleDelete = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!confirm("Вы уверены, что хотите удалить это распознавание?")) {
      return;
    }

    setDeletingId(id);
    try {
      await axios.delete(`http://localhost:9000/detect/${id}`);
      // Remove from local state
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
      <Box className={styles.loadingSection}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Загрузка истории...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchHistory} sx={{ ml: 2 }}>
          Повторить
        </Button>
      </Alert>
    );
  }

  if (history.length === 0) {
    return (
      <Alert severity="info">
        История распознаваний пуста. Загрузите первое изображение!
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        История распознаваний
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {history.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
            <Card className={styles.historyCard}>
              <Box className={styles.imageContainer}>
                <img
                  src={`http://localhost:9000/uploads/${item.imagePath}`}
                  alt={`Recognition ${item.id}`}
                  className={styles.historyImage}
                />
              </Box>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formatDate(item.createdAt)}
                </Typography>

                <Typography variant="h6" color="primary" gutterBottom>
                  Коров: {item.cowsCount}
                </Typography>

                {item.cowsCount > 0 && (
                  <Box className={styles.cowsGrid}>
                    {Array.from({ length: item.cowsCount }).map((_, i) => (
                      <Tooltip key={i} title={`Корова ${i + 1}`} arrow>
                        <Box className={styles.cowSquare}>{i + 1}</Box>
                      </Tooltip>
                    ))}
                  </Box>
                )}
              </CardContent>
              <CardActions
                sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
              >
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleView(item.id)}
                >
                  Подробнее
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => handleDelete(item.id, e)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? (
                    <CircularProgress size={20} />
                  ) : (
                    <DeleteIcon />
                  )}
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
