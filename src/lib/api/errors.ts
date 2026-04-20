import type { ZodError } from "zod";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ApiSchemaError extends Error {
  readonly zodError: ZodError;
  readonly payload: unknown;

  constructor(zodError: ZodError, payload: unknown) {
    super("Response schema validation failed");
    this.name = "ApiSchemaError";
    this.zodError = zodError;
    this.payload = payload;
  }
}
