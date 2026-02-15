type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

class ApiClient {
  private async request<T>(
    url: string,
    method: HttpMethod = "GET",
    body?: unknown,
  ): Promise<T> {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;

    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = data?.error?.message ?? data?.error ?? "Request failed";
      throw new Error(typeof msg === "string" ? msg : "Request failed");
    }

    return data as T;
  }

  get<T>(url: string) {
    return this.request<T>(url);
  }
  post<T>(url: string, body?: unknown) {
    return this.request<T>(url, "POST", body);
  }
  put<T>(url: string, body?: unknown) {
    return this.request<T>(url, "PUT", body);
  }
  patch<T>(url: string, body?: unknown) {
    return this.request<T>(url, "PATCH", body);
  }
  delete<T>(url: string) {
    return this.request<T>(url, "DELETE");
  }
}

export const apiClient = new ApiClient();
