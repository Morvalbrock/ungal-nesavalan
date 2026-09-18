const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiGet<T>(endpoint: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const response = await fetch(`${API_URL}${endpoint}`, { ...init, method: "GET" });
  if (!response.ok) throw new Error(`GET ${endpoint} failed`);
  return response.json();
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`POST ${endpoint} failed`);
  return response.json();
}
