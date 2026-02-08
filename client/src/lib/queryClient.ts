import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest(
  url: string,
  method: HttpMethod = "GET",
  data?: unknown | undefined,
): Promise<Response> {
  const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const upper = method?.toUpperCase?.() as HttpMethod || "GET";
  if (!validMethods.includes(upper)) {
    throw new Error(`Invalid HTTP method: ${method}`);
  }

  const res = await fetch(url, {
    method: upper,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export async function apiJson<T = unknown>(
  url: string, 
  method: HttpMethod = "GET", 
  data?: unknown
): Promise<T> {
  const res = await apiRequest(url, method, data);
  return (await res.json()) as T;
}

export const http = {
  get: <T = unknown>(url: string) => apiJson<T>(url, "GET"),
  post: <T = unknown>(url: string, data?: unknown) => apiJson<T>(url, "POST", data),
  put: <T = unknown>(url: string, data?: unknown) => apiJson<T>(url, "PUT", data),
  patch: <T = unknown>(url: string, data?: unknown) => apiJson<T>(url, "PATCH", data),
  del: <T = unknown>(url: string) => apiJson<T>(url, "DELETE"),
};

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
