import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { fastCache } from "./fastCache";
import { getInstantData } from "./instantData";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// export async function apiRequest(
//   method: string,
//   url: string,
//   data?: unknown | undefined,
// ): Promise<Response> {
//   const res = await fetch(url, {
//     method,
//     headers: data ? { "Content-Type": "application/json" } : {},
//     body: data ? JSON.stringify(data) : undefined,
//     credentials: "include",
//   });

//   await throwIfResNotOk(res);
//   return res;
// }

/**
 * Makes an HTTP request to the API and returns the parsed JSON data.
 * 
 * IMPORTANT: This function returns the PARSED DATA directly, NOT a Response object.
 * - Do NOT call `.json()` on the return value
 * - Do NOT check `.ok` on the return value
 * - Errors are automatically thrown and should be caught in mutation onError handlers
 * 
 * @example
 * // ✅ CORRECT usage:
 * const data = await apiRequest("POST", "/api/bookings", { name: "John" });
 * 
 * // ❌ INCORRECT usage:
 * const response = await apiRequest("POST", "/api/bookings", data);
 * if (!response.ok) { ... }  // ❌ response is data, not Response object
 * return response.json();     // ❌ Causes "response.json is not a function"
 * 
 * @param method - HTTP method (GET, POST, PATCH, PUT, DELETE)
 * @param url - API endpoint URL
 * @param body - Optional request body (will be JSON stringified)
 * @returns Promise resolving to the parsed JSON data
 * @throws Error if the request fails (status >= 400)
 */
export async function apiRequest<T = any>(
  method: string,
  url: string,
  body?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    credentials: "include", // Required for cookie-based auth
    headers: body ? {
      "Content-Type": "application/json",
    } : {},
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  // Handle cases like 204 No Content or empty body
  const rawText = await response.text();
  let data = null;

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (err) {
    console.warn("⚠️ Non-JSON response from server:", rawText);
    data = { message: rawText || "No response body" };
  }

  // Check if HTTP response was OK (status 2xx)
  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed: ${response.status}`,
    );
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const cacheKey = queryKey[0] as string;

    // Check instant data first for immediate response
    const instantData = getInstantData(cacheKey);
    if (instantData) {
      console.log(`Instant data served: ${cacheKey}`);
      // Also cache it for consistency
      fastCache.set(cacheKey, instantData, 60);
      return instantData;
    }

    // Check fast cache second
    if (fastCache.has(cacheKey)) {
      const cached = fastCache.get(cacheKey);
      console.log(`Fast cache hit: ${cacheKey}`);
      return cached;
    }

    const res = await fetch(cacheKey, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();

    // Store in fast cache for 30 minutes
    fastCache.set(cacheKey, data, 30);

    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Allow reconnect refetch
      refetchOnMount: false, // Don't refetch on mount if cache exists
      staleTime: 120 * 1000, // 120 seconds to match session cache
      gcTime: 300 * 1000, // 5 minutes garbage collection
      retry: 2, // Allow 2 retries for better reliability
      networkMode: "online",
      notifyOnChangeProps: ["data", "error"],
    },
    mutations: {
      retry: false,
      networkMode: "online",
    },
  },
});

// Make queryClient globally available for session cache integration
if (typeof window !== "undefined") {
  (window as any).queryClient = queryClient;
}
