/**
 * File validation utilities
 */

import {
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
  MESSAGES,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_VIDEO_TYPES,
} from "@/shared/config/constants";
import { ValidationError } from "./errorHandler";

/**
 * Convert MB to bytes
 */
const mbToBytes = (mb: number): number => mb * 1024 * 1024;

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): void => {
  // Check file type
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    throw new ValidationError(
      `${MESSAGES.ERROR_INVALID_FILE_TYPE}. Поддерживаются: JPG, PNG, WEBP`,
    );
  }

  // Check file size
  const maxSize = mbToBytes(MAX_IMAGE_SIZE_MB);
  if (file.size > maxSize) {
    throw new ValidationError(
      `${MESSAGES.ERROR_FILE_TOO_LARGE}. ${MESSAGES.WARNING_IMAGE_SIZE}`,
    );
  }
};

/**
 * Validate video file
 */
export const validateVideoFile = (file: File): void => {
  // Check file type
  if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
    throw new ValidationError(
      `${MESSAGES.ERROR_INVALID_FILE_TYPE}. Поддерживаются: MP4, AVI, MOV, MKV, WEBM`,
    );
  }

  // Check file size
  const maxSize = mbToBytes(MAX_VIDEO_SIZE_MB);
  if (file.size > maxSize) {
    throw new ValidationError(
      `${MESSAGES.ERROR_FILE_TOO_LARGE}. ${MESSAGES.WARNING_FILE_SIZE}`,
    );
  }
};

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
  return SUPPORTED_IMAGE_TYPES.includes(file.type);
};

/**
 * Check if file is a video
 */
export const isVideoFile = (file: File): boolean => {
  return SUPPORTED_VIDEO_TYPES.includes(file.type);
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

/**
 * Create object URL for file preview
 */
export const createFilePreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revoke object URL to free memory
 */
export const revokeFilePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Read file as data URL
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as data URL"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Read file as array buffer
 */
export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as array buffer"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsArrayBuffer(file);
  });
};
