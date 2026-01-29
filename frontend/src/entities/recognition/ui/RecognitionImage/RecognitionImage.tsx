"use client";

import { recognitionApi } from "@/shared/api/recognition.api";
import { Detection } from "@/shared/types/recognition";
import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import styles from "./RecognitionImage.module.scss";

interface RecognitionImageProps {
  imagePath: string;
  detections: Detection[];
  selectedCow: number | null;
  onImageLoad?: () => void;
}

export const RecognitionImage = ({
  imagePath,
  detections,
  selectedCow,
  onImageLoad,
}: RecognitionImageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageRef.current?.complete) {
      drawBoundingBoxes();
    }
  }, [detections, selectedCow]);

  const handleImageLoad = () => {
    drawBoundingBoxes();
    onImageLoad?.();
  };

  const drawBoundingBoxes = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!canvas || !image || !image.complete) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Draw image
    ctx.drawImage(image, 0, 0);

    // Draw bounding boxes
    detections.forEach((detection, index) => {
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

  return (
    <Box className={styles.imageContainer}>
      <img
        ref={imageRef}
        src={recognitionApi.getImageUrl(imagePath)}
        alt="Recognition"
        className={styles.hiddenImage}
        onLoad={handleImageLoad}
        crossOrigin="anonymous"
      />
      <canvas ref={canvasRef} className={styles.canvas} />
    </Box>
  );
};
