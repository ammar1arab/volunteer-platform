type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions {
  method?: HttpMethod;
  body?: any;
  headers?: HeadersInit;
}

class ApiClient {
  private async request<T>(url: string, options?: FetchOptions): Promise<T> {
    const body = options?.body;

    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;

    const headers: HeadersInit = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    };

    const config: RequestInit = {
      method: options?.method || "GET",
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
          ? body
          : JSON.stringify(body),
    };

    const res = await fetch(url, config);

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const msg = (data as any)?.error || "Request failed";
      throw new Error(msg);
    }

    return data as T;
  }

  get<T>(url: string) {
    return this.request<T>(url, { method: "GET" });
  }
  post<T>(url: string, body: any) {
    return this.request<T>(url, { method: "POST", body });
  }
  put<T>(url: string, body: any) {
    return this.request<T>(url, { method: "PUT", body });
  }
  delete<T>(url: string) {
    return this.request<T>(url, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
