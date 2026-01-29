"use client";

import { Detection } from "@/shared/types/recognition";
import { Box, Chip, Tooltip, Typography } from "@mui/material";
import styles from "./CowSelector.module.scss";

interface CowSelectorProps {
  detections: Detection[];
  selectedCow: number | null;
  onCowSelect: (index: number) => void;
  totalCount: number;
}

export const CowSelector = ({
  detections,
  selectedCow,
  onCowSelect,
  totalCount,
}: CowSelectorProps) => {
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Chip
          label={`Обнаружено коров: ${totalCount}`}
          color="primary"
          sx={{ mr: 1, mb: 1 }}
        />
        {detections.map((detection, index) => (
          <Chip
            key={index}
            label={`Корова ${index + 1}: ${(detection.confidence * 100).toFixed(1)}%`}
            variant={selectedCow === index ? "filled" : "outlined"}
            color={selectedCow === index ? "error" : "default"}
            onClick={() => onCowSelect(index)}
            sx={{ mr: 1, mb: 1, cursor: "pointer" }}
          />
        ))}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        💡 Нажмите на квадратик или chip, чтобы выделить конкретную корову
      </Typography>

      <Box className={styles.cowsGrid}>
        {Array.from({ length: totalCount }).map((_, i) => (
          <Tooltip key={i} title={`Корова ${i + 1}`} arrow>
            <Box
              className={`${styles.cowSquare} ${selectedCow === i ? styles.cowSquareSelected : ""}`}
              onClick={() => onCowSelect(i)}
            >
              🐄
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};
