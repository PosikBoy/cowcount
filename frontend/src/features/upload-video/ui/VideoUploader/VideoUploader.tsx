"use client";

import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { Alert, Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import styles from "./VideoUploader.module.scss";

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  onUpload: () => void;
  selectedFile: File | null;
  loading: boolean;
  error: string | null;
}

export const VideoUploader = ({
  onFileSelect,
  onUpload,
  selectedFile,
  loading,
  error,
}: VideoUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (loading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("video/")) {
        onFileSelect(file);
      }
    }
  };

  return (
    <Box className={styles.container}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        className={`${styles.uploadSection} ${isDragging ? styles.dragging : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          accept="video/*"
          style={{ display: "none" }}
          id="video-upload"
          type="file"
          onChange={handleFileChange}
          disabled={loading}
        />

        <VideoLibraryIcon
          sx={{
            fontSize: 48,
            color: isDragging ? "#1565c0" : "#1976d2",
            mb: 2,
          }}
        />

        <Typography variant="h6" gutterBottom>
          {isDragging ? "Отпустите видео здесь" : "Перетащите видео сюда"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          или
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 2, display: "block" }}
        >
          Максимальная длительность: 10 минут, размер: 200 МБ
        </Typography>

        <label htmlFor="video-upload">
          <Button
            variant="outlined"
            component="span"
            disabled={loading}
            size="large"
          >
            Выбрать видео
          </Button>
        </label>

        {selectedFile && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              ✓ Выбран файл: {selectedFile.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Размер: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </Typography>
          </Box>
        )}
      </Box>

      {selectedFile && !loading && (
        <Button
          variant="contained"
          color="primary"
          onClick={onUpload}
          size="large"
          fullWidth
          sx={{ mt: 2 }}
        >
          Обработать видео
        </Button>
      )}
    </Box>
  );
};
