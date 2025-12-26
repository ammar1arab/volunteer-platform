type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

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
      body:
        body === undefined
          ? undefined
          : isFormData
          ? (body as FormData)
          : JSON.stringify(body),
    };

    const res = await fetch(url, config);

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    const data = isJson
      ? await res.json().catch(() => null)
      : await res.text().catch(() => "");

    if (!res.ok) {
      let msg = "Request failed";

      if (data && typeof data === "object" && data !== null && "error" in data) {
        msg = String((data as { error: unknown }).error);
      }

      throw new Error(msg);
    }

    return data as T;
  }

  get<T>(url: string) {
    return this.request<T>(url, { method: "GET" });
  }

  post<T>(url: string, body?: unknown) {
    return this.request<T>(url, { method: "POST", body });
  }

  put<T>(url: string, body?: unknown) {
    return this.request<T>(url, { method: "PUT", body });
  }

  delete<T>(url: string) {
    return this.request<T>(url, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();