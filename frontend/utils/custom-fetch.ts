import { SuccessResponse, ErrorResponse } from "@/types/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchJson<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<SuccessResponse<T> | ErrorResponse> {
  try {
    const response = await fetch(`${process.env.API_URL}/api/${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message: data?.error?.message || "Unknown error",
        code: data?.error?.code || "UNKNOWN_ERROR",
        details: data?.error?.details,
      },
    };

    return errorResponse;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // For non-JSON or network failures
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message: err?.message || "Network error",
        code: "NETWORK_ERROR",
      },
    };

    return errorResponse;
  }
}
