"use client";

import { formatDate } from "@/shared/lib/utils/formatDate";
import { Recognition } from "@/shared/types/recognition";
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import { useState } from "react";
import { RecognitionImage } from "../RecognitionImage/RecognitionImage";
import styles from "./RecognitionDetail.module.scss";

interface RecognitionDetailProps {
  recognition: Recognition;
}

export const RecognitionDetail = ({ recognition }: RecognitionDetailProps) => {
  const [selectedCow, setSelectedCow] = useState<number | null>(null);

  const handleCowClick = (index: number) => {
    setSelectedCow(selectedCow === index ? null : index);
  };

  return (
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

        <RecognitionImage
          imagePath={recognition.imagePath}
          detections={recognition.result}
          selectedCow={selectedCow}
        />

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
                className={`${styles.detailCard} ${selectedCow === index ? styles.selected : ""}`}
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
                  {detection.bbox.x2.toFixed(0)}, {detection.bbox.y2.toFixed(0)}
                  )
                </Typography>
              </Card>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
