/**
 * Application-wide constants
 */

// API Configuration
// These values are read from environment variables (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL)
// Fallback to production API if not set
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.cowcounter.dealive.ru";
export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || "wss://api.cowcounter.dealive.ru";

// File Upload Limits
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_VIDEO_SIZE_MB = 200;
export const MAX_VIDEO_DURATION_MINUTES = 10;

// Supported File Types
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
export const SUPPORTED_VIDEO_TYPES = [
  "video/mp4",
  "video/avi",
  "video/mov",
  "video/mkv",
  "video/webm",
];

// Video Processing
export const DEFAULT_SAMPLE_INTERVAL = 1.0; // seconds
export const STREAM_FPS = 10; // frames per second for live stream
export const STREAM_FRAME_INTERVAL = 1000 / STREAM_FPS; // milliseconds

// WebSocket
export const WS_RECONNECT_DELAY = 3000; // milliseconds
export const WS_PING_INTERVAL = 30000; // milliseconds

// UI Messages
export const MESSAGES = {
  // Success
  SUCCESS_UPLOAD: "Файл успешно загружен",
  SUCCESS_DETECTION: "Распознавание завершено",
  SUCCESS_VIDEO_ANALYSIS: "Видео успешно обработано",

  // Errors
  ERROR_CAMERA_ACCESS:
    "Не удалось получить доступ к камере. Проверьте разрешения браузера.",
  ERROR_FILE_TOO_LARGE: "Файл слишком большой",
  ERROR_INVALID_FILE_TYPE: "Неподдерживаемый тип файла",
  ERROR_UPLOAD_FAILED: "Ошибка загрузки файла",
  ERROR_DETECTION_FAILED: "Ошибка распознавания",
  ERROR_VIDEO_ANALYSIS_FAILED: "Ошибка обработки видео",
  ERROR_WS_CONNECTION: "Ошибка подключения к серверу",
  ERROR_WS_DISCONNECTED: "Соединение с сервером потеряно",
  ERROR_NETWORK: "Ошибка сети. Проверьте подключение к интернету.",
  ERROR_SERVER: "Ошибка сервера. Попробуйте позже.",
  ERROR_RATE_LIMIT: "Превышен лимит запросов. Подождите минуту.",

  // Info
  INFO_DRAG_DROP: "Перетащите файл сюда",
  INFO_OR: "или",
  INFO_SELECT_FILE: "Выбрать файл",
  INFO_PROCESSING: "Обработка...",
  INFO_LOADING: "Загрузка...",
  INFO_CAMERA_INACTIVE: "Камера не активна",
  INFO_CONNECTED: "Подключено",
  INFO_CONNECTING: "Подключение...",

  // Warnings
  WARNING_VIDEO_DURATION: `Максимальная длительность: ${MAX_VIDEO_DURATION_MINUTES} минут`,
  WARNING_FILE_SIZE: `Максимальный размер: ${MAX_VIDEO_SIZE_MB} МБ`,
  WARNING_IMAGE_SIZE: `Максимальный размер: ${MAX_IMAGE_SIZE_MB} МБ`,
} as const;

// UI Labels
export const LABELS = {
  // Navigation
  NAV_HOME: "Главная",
  NAV_HISTORY: "История",
  NAV_ABOUT: "О системе",

  // Tabs
  TAB_IMAGE: "Изображение",
  TAB_VIDEO: "Видео",
  TAB_CAMERA: "Камера",

  // Buttons
  BTN_UPLOAD: "Загрузить",
  BTN_PROCESS: "Обработать",
  BTN_ANALYZE: "Анализировать",
  BTN_START_CAMERA: "Включить камеру",
  BTN_STOP_CAMERA: "Выключить камеру",
  BTN_DELETE: "Удалить",
  BTN_BACK: "Назад",
  BTN_SELECT_FILE: "Выбрать файл",
  BTN_SELECT_IMAGE: "Выбрать изображение",
  BTN_SELECT_VIDEO: "Выбрать видео",
  BTN_PROCESS_IMAGE: "Обработать изображение",
  BTN_PROCESS_VIDEO: "Обработать видео",

  // Stats
  STAT_COWS_DETECTED: "Обнаружено коров",
  STAT_TOTAL_COWS: "Всего коров",
  STAT_MAX_IN_FRAME: "Максимум в кадре",
  STAT_AVERAGE: "Среднее",
  STAT_DURATION: "Длительность",
  STAT_FPS: "FPS",
  STAT_RESOLUTION: "Разрешение",

  // File Info
  FILE_SELECTED: "Выбран файл",
  FILE_SIZE: "Размер",
  FILE_NAME: "Имя файла",
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  HISTORY: "/history",
  ABOUT: "/about",
  RECOGNITION: (id: number) => `/recognition/${id}`,
} as const;

// Animation Durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Colors
export const COLORS = {
  BBOX_STROKE: "#00ff00",
  BBOX_FILL: "#00ff00",
  BBOX_TEXT: "#000000",
  SUCCESS: "#4caf50",
  ERROR: "#f44336",
  WARNING: "#ff9800",
  INFO: "#2196f3",
} as const;
