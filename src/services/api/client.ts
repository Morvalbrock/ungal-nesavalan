const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function apiGet<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, { ...init, method: "GET" });
  if (!response.ok) throw new Error(`GET ${endpoint} failed with ${response.status}`);
  return response.json();
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`POST ${endpoint} failed with ${response.status}`);
  return response.json();
}
