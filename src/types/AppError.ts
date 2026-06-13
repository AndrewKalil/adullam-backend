import type { FieldError } from "./common";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: FieldError[] | string,
  ) {
    super(message);
    this.name = "AppError";
  }
}
