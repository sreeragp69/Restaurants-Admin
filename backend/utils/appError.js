 /**
 * Custom Error class for application-specific errors.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, extras = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.extras = extras;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Predefined error types for common scenarios.
 */
const ErrorTypes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  BAD_REQUEST: "BAD_REQUEST",
  FORBIDDEN: "FORBIDDEN",
  UNAUTHORIZED: "UNAUTHORIZED",
};

/**
 * Factory functions for common errors.
 */
const createError = {
  validation: (message = "Validation failed", extras = null) =>
    new AppError(message, 400, extras),

  unauthorized: (message = "Unauthorized access") => new AppError(message, 401),

  forbidden: (message = "Forbidden access") => new AppError(message, 403),

  notFound: (message = "Resource not found") => new AppError(message, 404),

  conflict: (message = "Resource already exists") => new AppError(message, 409),

  internal: (message = "Internal server error") => new AppError(message, 500),

  badRequest: (message = "Bad request", extras = null) =>
    new AppError(message, 400, extras),
};

module.exports = {
  AppError,
  ErrorTypes,
  createError,
};
