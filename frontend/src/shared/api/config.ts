import { API_BASE_URL, WS_BASE_URL } from "@/shared/config/constants";

export { API_BASE_URL, WS_BASE_URL };

export const API_ENDPOINTS = {
  // Detection
  DETECT: "/detect",
  DETECT_HISTORY: "/detect/history",
  DETECT_BY_ID: (id: number) => `/detect/${id}`,
  DETECT_DELETE: (id: number) => `/detect/${id}`,
  DETECT_STATS: "/detect/stats/summary",

  // Video
  VIDEO_ANALYZE: "/video/analyze",
  VIDEO_STREAM: (filename: string) => `/video/stream/${filename}`,
  VIDEO_DELETE: (filename: string) => `/video/${filename}`,

  // WebSocket
  WS_VIDEO_STREAM: "/stream/video",

  // Uploads
  UPLOADS: (filename: string) => `/uploads/${filename}`,

  // Health
  HEALTH: "/health",
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

export const getWsUrl = (endpoint: string): string => {
  return `${WS_BASE_URL}${endpoint}`;
};
