export type ErrorCode =
  | "EMPLOYEE_NOT_FOUND"
  | "EMPLOYEE_INACTIVE"
  | "TIME_ENTRY_NOT_FOUND"
  | "TIME_ENTRY_LOCKED"
  | "FUTURE_DATE_NOT_ALLOWED"
  | "VALIDATION_ERROR"
  | "APPROVAL_NOT_FOUND"
  | "ALREADY_APPROVED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export interface ErrorEnvelope {
  ok: false;
  code: ErrorCode;
  message: string;
}

export interface SuccessEnvelope<T> {
  ok: true;
  data: T;
}
