"use client";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Alert, Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import styles from "./ImageUploader.module.scss";

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  onUpload: () => void;
  selectedFile: File | null;
  loading: boolean;
  error: string | null;
}

export const ImageUploader = ({
  onFileSelect,
  onUpload,
  selectedFile,
  loading,
  error,
}: ImageUploaderProps) => {
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
      if (file.type.startsWith("image/")) {
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
          accept="image/*"
          style={{ display: "none" }}
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          disabled={loading}
        />

        <CloudUploadIcon
          sx={{
            fontSize: 48,
            color: isDragging ? "#1565c0" : "#1976d2",
            mb: 2,
          }}
        />

        <Typography variant="h6" gutterBottom>
          {isDragging ? "Отпустите файл здесь" : "Перетащите изображение сюда"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          или
        </Typography>

        <label htmlFor="file-upload">
          <Button
            variant="outlined"
            component="span"
            disabled={loading}
            size="large"
          >
            Выбрать файл
          </Button>
        </label>

        {selectedFile && (
          <Typography variant="body2" sx={{ mt: 2, fontWeight: 500 }}>
            ✓ Выбран файл: {selectedFile.name}
          </Typography>
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
          Распознать коров
        </Button>
      )}
    </Box>
  );
};
