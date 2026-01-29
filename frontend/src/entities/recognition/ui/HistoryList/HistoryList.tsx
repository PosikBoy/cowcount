"use client";

import { recognitionApi } from "@/shared/api/recognition.api";
import { formatDate } from "@/shared/lib/utils/formatDate";
import { Recognition } from "@/shared/types/recognition";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
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
import styles from "./HistoryList.module.scss";

interface HistoryListProps {
  items: Recognition[];
  onView: (id: number) => void;
  onDelete: (id: number) => void;
  deletingId: number | null;
}

export const HistoryList = ({
  items,
  onView,
  onDelete,
  deletingId,
}: HistoryListProps) => {
  const handleDelete = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(id);
  };

  return (
    <Grid container spacing={3}>
      {items.map((item) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
          <Card className={styles.historyCard}>
            <Box className={styles.imageContainer}>
              <img
                src={recognitionApi.getImageUrl(item.imagePath)}
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
            <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
              <Button
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => onView(item.id)}
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
  );
};
