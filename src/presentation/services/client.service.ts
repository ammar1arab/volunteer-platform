type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type RequestBody = object | FormData | null | undefined;

interface ApiErrorBody {
  error?: string | { message?: string; code?: string };
  message?: string;
}

class ApiClient {
  private async request<T>(url: string, method: HttpMethod = "GET", body?: RequestBody): Promise<T> {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      body: body === undefined || body === null ? undefined : isFormData ? body : JSON.stringify(body)
    });

    const data = (await res.json().catch(() => null)) as ApiErrorBody | T | null;

    if (!res.ok) {
      const errorField = data && typeof data === "object" && "error" in data ? data.error : undefined;
      const msg =
        (typeof errorField === "object" && errorField?.message) ||
        (typeof errorField === "string" ? errorField : undefined) ||
        (data && typeof data === "object" && "message" in data && typeof data.message === "string"
          ? data.message
          : undefined) ||
        "Request failed";
      throw new Error(msg);
    }

    return data as T;
  }

  get<T>(url: string) {
    return this.request<T>(url);
  }
  post<T>(url: string, body?: RequestBody) {
    return this.request<T>(url, "POST", body);
  }
  put<T>(url: string, body?: RequestBody) {
    return this.request<T>(url, "PUT", body);
  }
  patch<T>(url: string, body?: RequestBody) {
    return this.request<T>(url, "PATCH", body);
  }
  delete<T>(url: string) {
    return this.request<T>(url, "DELETE");
  }
}

export const apiClient = new ApiClient();
