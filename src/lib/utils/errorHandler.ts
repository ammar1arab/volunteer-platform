import { NextResponse } from "next/server";
import Logger from "./logger";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function handleApiError(error: unknown, requestId: string) {
  if (error instanceof ApiError) {
    Logger.error(`[${requestId}] API Error`, error, {
      statusCode: error.statusCode,
      code: error.code,
    });

    return NextResponse.json(
      { success: false, error: error.message, code: error.code, requestId },
      { status: error.statusCode }
    );
  }

  const code = (error as any)?.code;

  if (code === "P2002") {
    Logger.error(`[${requestId}] Prisma unique constraint`, error);
    return NextResponse.json(
      { success: false, error: "Email already exists", requestId },
      { status: 409 }
    );
  }

  if (code) {
    Logger.error(`[${requestId}] Database error`, error, { code });
    return NextResponse.json(
      { success: false, error: "Database error", requestId },
      { status: 500 }
    );
  }

  Logger.error(`[${requestId}] Unexpected error`, error);

  return NextResponse.json(
    {
      success: false,
      error: "Internal server error",
      requestId,
      details: process.env.NODE_ENV === "development" ? getErrorMessage(error) : undefined,
    },
    { status: 500 }
  );
}
