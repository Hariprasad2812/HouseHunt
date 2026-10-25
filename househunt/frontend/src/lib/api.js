// Thin REST client for the HouseHunt Spring Boot API.
// All requests go to the same origin (/api) and are proxied to the backend
// during development by Vite; the token is attached automatically.

const TOKEN_KEY = 'hh_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, status, fieldErrors = null, path = '') {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.path = path;
  }
}

async function request(method, url, { body, form } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (form) payload = form;
  else if (body) payload = JSON.stringify(body);

  const res = await fetch(url, { method, headers, body: payload });
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    if (res.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      window.dispatchEvent(new CustomEvent('hh:unauthorized'));
    }
    const fieldErrors = data && data.fieldErrors ? data.fieldErrors : null;
    throw new ApiError(
      (data && (data.message || data.error)) || 'Something went wrong. Please try again.',
      res.status,
      fieldErrors,
      data && data.path,
    );
  }
  return data;
}

export const api = {
  get: (url, params) => {
    if (!params) return request('GET', `/api${url}`);
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      if (Array.isArray(v)) v.forEach((x) => usp.append(k, x));
      else usp.append(k, v);
    });
    const q = usp.toString();
    return request('GET', `/api${url}${q ? '?' + q : ''}`);
  },
  post: (url, body) => request('POST', `/api${url}`, { body }),
  put: (url, body) => request('PUT', `/api${url}`, { body }),
  patch: (url, body) => request('PATCH', `/api${url}`, { body }),
  del: (url) => request('DELETE', `/api${url}`),
  upload: (url, file) => {
    const form = new FormData();
    form.append('file', file);
    return request('POST', `/api${url}`, { form });
  },
};

// Tiny hook-style loading helper reused across views.
export async function load(promise) {
  try {
    return { ok: true, data: await promise };
  } catch (err) {
    return { ok: false, error: err.message || 'Request failed' };
  }
}
