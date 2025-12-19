type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
}

class ApiClient {
  private async request<T>(url: string, options?: FetchOptions): Promise<T> {
    const body = options?.body;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    const headers: HeadersInit = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    };

    const config: RequestInit = {
      method: options?.method || "GET",
      headers,
      credentials: "include",
      body: body
        ? isFormData
          ? (body as FormData)
          : JSON.stringify(body)
        : undefined,
    };

    const response = await fetch(url, config);

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => "");

    if (!response.ok) {
      const msg =
        (data && typeof data === "object" && "error" in (data as any) && (data as any).error) ||
        "Request failed";
      throw new ApiError(String(msg), response.status, data);
    }

    return data as T;
  }

  get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: "GET" });
  }

  post<T>(url: string, body?: unknown): Promise<T> {
    return this.request<T>(url, { method: "POST", body });
  }

  put<T>(url: string, body?: unknown): Promise<T> {
    return this.request<T>(url, { method: "PUT", body });
  }

  delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
