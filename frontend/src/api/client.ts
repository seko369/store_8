import { API_ORIGIN } from "../lib/config";

const API_BASE_URL = `${API_ORIGIN}/api/v1`;

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | undefined>;
};

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;

  const url = new URL(
    `${API_BASE_URL}${path}`,
    window.location.origin,
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: "include",
  });

  if (!response.ok) {
    let message = "خطایی در ارتباط با سرور رخ داد.";

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        message =
          typeof errorData.detail === "string"
            ? errorData.detail
            : message;
      }
    } catch {
      // Ignore invalid error response
    }

    throw new Error(message);
  }

  return response.json();
}