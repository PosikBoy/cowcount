# Frontend Refactoring Documentation

## 🎯 Цели рефакторинга

1. **Централизация констант** - все строки, URL и конфигурация в одном месте
2. **Обработка ошибок** - единообразная система обработки ошибок
3. **Валидация** - переиспользуемые утилиты для валидации файлов
4. **Типобезопасность** - строгая типизация для всех компонентов
5. **Масштабируемость** - легко добавлять новые функции

## 📁 Новая структура

```
frontend/src/
├── shared/
│   ├── config/
│   │   ├── constants.ts          # Все константы приложения
│   │   └── theme.ts               # Тема Material UI
│   ├── lib/
│   │   └── utils/
│   │       ├── errorHandler.ts    # Обработка ошибок
│   │       ├── fileValidation.ts  # Валидация файлов
│   │       └── formatDate.ts      # Форматирование дат
│   ├── api/
│   │   ├── config.ts              # API конфигурация
│   │   └── recognition.api.ts     # API методы
│   └── types/
│       └── recognition.ts         # TypeScript типы
```

## 🔧 Созданные утилиты

### 1. Constants (`shared/config/constants.ts`)

Централизованное хранение всех констант:

```typescript
// API Configuration
export const API_BASE_URL = "http://localhost:8000";
export const WS_BASE_URL = "ws://localhost:8000";

// File Limits
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_VIDEO_SIZE_MB = 200;

// Messages
export const MESSAGES = {
  ERROR_CAMERA_ACCESS: "Не удалось получить доступ к камере...",
  SUCCESS_UPLOAD: "Файл успешно загружен",
  // ... и т.д.
};

// Labels
export const LABELS = {
  BTN_UPLOAD: "Загрузить",
  STAT_COWS_DETECTED: "Обнаружено коров",
  // ... и т.д.
};
```

**Преимущества:**

- ✅ Легко изменить текст во всем приложении
- ✅ Поддержка i18n в будущем
- ✅ Нет дублирования строк
- ✅ Типобезопасность с `as const`

### 2. Error Handler (`shared/lib/utils/errorHandler.ts`)

Система обработки ошибок с кастомными классами:

```typescript
// Кастомные классы ошибок
export class AppError extends Error {}
export class NetworkError extends AppError {}
export class ValidationError extends AppError {}
export class ServerError extends AppError {}
export class RateLimitError extends AppError {}

// Парсинг ошибок API
export const parseApiError = (error: unknown): string => {};

// Обработка fetch ошибок
export const handleFetchError = async (response: Response) => {};

// Безопасная обертка для async функций
export const safeAsync = async <T>(fn: () => Promise<T>) => {};

// Retry с exponential backoff
export const retryAsync = async <T>(fn: () => Promise<T>) => {};

// Логирование ошибок
export const logError = (error: unknown, context?: string) => {};
```

**Использование:**

```typescript
// Вместо try-catch
const [result, error] = await safeAsync(() => api.detectCows(file));
if (error) {
  setError(error.message);
  return;
}

// Автоматический retry
const result = await retryAsync(() => api.fetchData(), 3, 1000);

// Обработка fetch ошибок
if (!response.ok) {
  await handleFetchError(response); // Бросит типизированную ошибку
}
```

### 3. File Validation (`shared/lib/utils/fileValidation.ts`)

Утилиты для работы с файлами:

```typescript
// Валидация
export const validateImageFile = (file: File): void => {};
export const validateVideoFile = (file: File): void => {};

// Проверки типов
export const isImageFile = (file: File): boolean => {};
export const isVideoFile = (file: File): boolean => {};

// Форматирование
export const formatFileSize = (bytes: number): string => {};

// Работа с URL
export const createFilePreviewUrl = (file: File): string => {};
export const revokeFilePreviewUrl = (url: string): void => {};

// Чтение файлов
export const readFileAsDataURL = (file: File): Promise<string> => {};
export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {};
```

**Использование:**

```typescript
// Валидация перед загрузкой
try {
  validateImageFile(file);
  // Файл валиден, можно загружать
} catch (error) {
  if (error instanceof ValidationError) {
    setError(error.message); // Понятное сообщение пользователю
  }
}

// Форматирование размера
const sizeText = formatFileSize(file.size); // "2.5 MB"
```

### 4. API Config (`shared/api/config.ts`)

Централизованная конфигурация API:

```typescript
export const API_ENDPOINTS = {
  DETECT: "/detect",
  DETECT_HISTORY: "/detect/history",
  DETECT_BY_ID: (id: number) => `/detect/${id}`,
  VIDEO_ANALYZE: "/video/analyze",
  WS_VIDEO_STREAM: "/stream/video",
  // ... и т.д.
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

export const getWsUrl = (endpoint: string): string => {
  return `${WS_BASE_URL}${endpoint}`;
};
```

**Использование:**

```typescript
// Вместо хардкода URL
const url = getApiUrl(API_ENDPOINTS.DETECT);
const wsUrl = getWsUrl(API_ENDPOINTS.WS_VIDEO_STREAM);
```

## 🔄 Как использовать в компонентах

### Пример: ImageUploader с новой архитектурой

```typescript
import { MESSAGES, LABELS } from "@/shared/config/constants";
import { validateImageFile, formatFileSize } from "@/shared/lib/utils/fileValidation";
import { ValidationError } from "@/shared/lib/utils/errorHandler";

export const ImageUploader = ({ onFileSelect }: Props) => {
  const [error, setError] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Валидация с понятными ошибками
      validateImageFile(file);
      setError("");
      onFileSelect(file);
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message);
      } else {
        setError(MESSAGES.ERROR_UPLOAD_FAILED);
      }
    }
  };

  return (
    <Box>
      {error && <Alert severity="error">{error}</Alert>}

      <Typography>{MESSAGES.INFO_DRAG_DROP}</Typography>
      <Typography>{MESSAGES.INFO_OR}</Typography>

      <Button>{LABELS.BTN_SELECT_IMAGE}</Button>

      {file && (
        <Typography>
          {LABELS.FILE_SELECTED}: {file.name}
          <br />
          {LABELS.FILE_SIZE}: {formatFileSize(file.size)}
        </Typography>
      )}

      <Typography variant="caption">
        {MESSAGES.WARNING_IMAGE_SIZE}
      </Typography>
    </Box>
  );
};
```

### Пример: API вызов с обработкой ошибок

```typescript
import { safeAsync, logError } from "@/shared/lib/utils/errorHandler";
import { MESSAGES } from "@/shared/config/constants";

const handleUpload = async () => {
  setLoading(true);

  const [result, error] = await safeAsync(
    () => recognitionApi.detectCows(file),
    (err) => logError(err, "ImageUpload"),
  );

  setLoading(false);

  if (error) {
    setError(error.message);
    return;
  }

  setResult(result);
  setSuccess(MESSAGES.SUCCESS_DETECTION);
};
```

## 📋 Чеклист для рефакторинга компонентов

- [ ] Заменить хардкод строк на `MESSAGES` и `LABELS`
- [ ] Использовать `validateImageFile`/`validateVideoFile` для валидации
- [ ] Обернуть API вызовы в `safeAsync` или `try-catch` с `handleFetchError`
- [ ] Использовать `API_ENDPOINTS` вместо хардкод URL
- [ ] Добавить `logError` для важных ошибок
- [ ] Использовать `formatFileSize` для отображения размеров
- [ ] Заменить магические числа на константы из `constants.ts`

## 🎨 Преимущества новой архитектуры

1. **Maintainability** - легко поддерживать и изменять
2. **Testability** - утилиты легко тестировать
3. **Reusability** - переиспользование кода
4. **Type Safety** - строгая типизация
5. **Error Handling** - единообразная обработка ошибок
6. **Scalability** - легко масштабировать
7. **i18n Ready** - готово к интернационализации

## 🚀 Следующие шаги

1. Рефакторинг существующих компонентов с использованием новых утилит
2. Добавление unit тестов для утилит
3. Интеграция с error tracking (Sentry)
4. Добавление i18n поддержки
5. Создание storybook для компонентов

## 📚 Дополнительные ресурсы

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Error Handling Best Practices](https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
