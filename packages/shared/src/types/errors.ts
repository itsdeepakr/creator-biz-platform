import { ErrorCode } from '../constants/error-codes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode | string;
  public readonly details?: Record<string, any> | string[];

  constructor(
    message: string,
    statusCode = 500,
    errorCode: ErrorCode | string = ErrorCode.INTERNAL_SERVER_ERROR,
    details?: Record<string, any> | string[]
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: Record<string, any>) {
    super(message, 401, ErrorCode.AUTH_UNAUTHORIZED, details);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access', details?: Record<string, any>) {
    super(message, 403, ErrorCode.AUTH_FORBIDDEN, details);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      404,
      ErrorCode.RESOURCE_NOT_FOUND
    );
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errorCode: ErrorCode | string = ErrorCode.VALIDATION_ERROR, details?: Record<string, any>) {
    super(message, 400, errorCode, details);
    this.name = 'BadRequestError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errorCode: ErrorCode | string = ErrorCode.VALIDATION_ERROR, details?: Record<string, any>) {
    super(message, 409, errorCode, details);
    this.name = 'ConflictError';
  }
}
