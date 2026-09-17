export const API_URL = import.meta.env.VITE_API_URL ?? '';

/** Bridge for the Claude-built backend: point this at real endpoints once it's live. */
export async function apiFetch(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return res.json();
}
