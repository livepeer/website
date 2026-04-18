export class PmtHouseError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    message: string,
    {
      status = 500,
      code = "pymthouse_error",
      details,
    }: {
      status?: number;
      code?: string;
      details?: unknown;
    } = {},
  ) {
    super(message);
    this.name = "PmtHouseError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function toPmtHouseError(
  error: unknown,
  fallbackMessage: string,
): PmtHouseError {
  if (error instanceof PmtHouseError) {
    return error;
  }

  if (error instanceof Error) {
    return new PmtHouseError(error.message || fallbackMessage, {
      code: "unexpected_error",
      status: 500,
    });
  }

  return new PmtHouseError(fallbackMessage, {
    code: "unexpected_error",
    status: 500,
  });
}
