const { VITE_API_ENDPOINT } = import.meta.env;

if (!VITE_API_ENDPOINT) {
  throw new Error('VITE_API_ENDPOINT is not set');
}

export async function fetchJSON<T>(
  url: RequestInfo,
  init?: RequestInit | undefined
): Promise<T> {
  const secret = localStorage.getItem('secret');
  const hasQuery = url.toString().includes('?');
  const response = await fetch(
    `${VITE_API_ENDPOINT}${url}${hasQuery ? '&' : '?'}secret=${secret}`,
    init
  );

  if (!response.ok) {
    if (response.headers.get('Content-Type')?.includes('application/json')) {
      const body = await response.json();
      throw new Error(body);
    } else {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
  }
  const body = await response.json();
  return body;
}

export function getScreenshotUrl(filename: string): string {
  return `${VITE_API_ENDPOINT}/screenshots/${filename}`;
}
