const fallbackApiOrigin = import.meta.env.DEV ? "http://localhost:8000" : "";

export const API_ORIGIN =
  (import.meta.env.VITE_API_ORIGIN as string | undefined) ?? fallbackApiOrigin;

export function getAssetUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_ORIGIN}${path}`;
}