export const API_URL = import.meta.env.VITE_API_URL ?? '';

/** Normalized shape for every failure apiFetch/fetchPage can throw. */
export class ApiError extends Error {
  constructor(message, { status, statusText, url } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status ?? 0;
    this.statusText = statusText ?? '';
    this.url = url;
  }
}

/** Turns { page: 1, categoria: 'Laptops' } into "?page=1&categoria=Laptops", skipping empty values. */
function buildQueryString(params) {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

/** Runs the fetch and normalizes both network failures and non-OK responses into ApiError. */
async function request(path, { params, ...options } = {}) {
  const url = `${API_URL}${path}${buildQueryString(params)}`;
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', { status: 0, url });
  }

  if (!res.ok) {
    let message = res.statusText || `Error ${res.status}`;
    try {
      const body = await res.clone().json();
      message = body?.message ?? message;
    } catch {
      // no JSON body to read a message from — keep the statusText fallback
    }
    throw new ApiError(message, { status: res.status, statusText: res.statusText, url });
  }

  return res;
}

/** Bridge for the Claude-built backend: point this at real endpoints once it's live. */
export async function apiFetch(path, options) {
  const res = await request(path, options);
  return res.status === 204 ? null : res.json();
}

/**
 * Fetches one page of a MockAPI collection. `page`/`limit` become MockAPI's
 * pagination query params (MockAPI only paginates when both are present);
 * any other key in `params` is passed through as a filter (e.g.
 * { categoria: 'Laptops' }).
 *
 * `total`/`totalPages` are only set when the server sends `X-Total-Count` —
 * plenty of MockAPI projects don't. When it's missing they come back `null`
 * instead of a guessed value, so a caller never renders a wrong page count.
 * `hasMore` works either way: true when this page came back full, meaning
 * there's probably a next one.
 */
export async function fetchPage(path, { page = 1, limit = 10, ...filters } = {}) {
  const res = await request(path, { params: { page, limit, ...filters } });
  const data = await res.json();
  const totalHeader = res.headers.get('X-Total-Count');
  const total = totalHeader !== null ? Number(totalHeader) : null;
  const totalPages = total !== null ? Math.max(1, Math.ceil(total / limit)) : null;
  const hasMore = data.length === limit;
  return { data, page, limit, total, totalPages, hasMore };
}
