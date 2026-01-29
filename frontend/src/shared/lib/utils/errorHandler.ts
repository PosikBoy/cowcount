/**
 * Error handling utilities
 */

import { MESSAGES } from "@/shared/config/constants";

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NetworkError extends AppError {
  constructor(message: string = MESSAGES.ERROR_NETWORK) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class ServerError extends AppError {
  constructor(message: string = MESSAGES.ERROR_SERVER) {
    super(message, "SERVER_ERROR", 500);
    this.name = "ServerError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = MESSAGES.ERROR_RATE_LIMIT) {
    super(message, "RATE_LIMIT_ERROR", 429);
    this.name = "RateLimitError";
  }
}

/**
 * Parse error from API response
 */
export const parseApiError = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "detail" in error &&
    typeof error.detail === "string"
  ) {
    return error.detail;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return MESSAGES.ERROR_SERVER;
};

/**
 * Handle fetch errors
 */
export const handleFetchError = async (response: Response): Promise<never> => {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const data = await response.json();
    const message = parseApiError(data);

    if (response.status === 429) {
      throw new RateLimitError(message);
    }

    if (response.status >= 500) {
      throw new ServerError(message);
    }

    if (response.status >= 400) {
      throw new ValidationError(message);
    }

    throw new AppError(message, "API_ERROR", response.status);
  }

  // Non-JSON error response
  const text = await response.text();
  throw new AppError(
    text || `HTTP Error ${response.status}`,
    "HTTP_ERROR",
    response.status,
  );
};

/**
 * Safe async wrapper with error handling
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>,
  onError?: (error: AppError) => void,
): Promise<[T | null, AppError | null]> => {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    const appError =
      error instanceof AppError ? error : new AppError(parseApiError(error));

    if (onError) {
      onError(appError);
    }

    return [null, appError];
  }
};

/**
 * Retry async function with exponential backoff
 */
export const retryAsync = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i < maxRetries - 1) {
        // Wait before retry with exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * Math.pow(2, i)),
        );
      }
    }
  }

  throw lastError!;
};

export const logError = (error: unknown, context?: string): void => {
  const timestamp = new Date().toISOString();
  const errorMessage = parseApiError(error);

  console.error(`[${timestamp}] Error${context ? ` in ${context}` : ""}:`, {
    message: errorMessage,
    error,
  });
};
