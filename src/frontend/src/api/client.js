const BASE = '/api';

export async function api(endpoint, options = {}) {
  const auth = localStorage.getItem('auth');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (auth) {
    const { token } = JSON.parse(auth);
    headers['Authorization'] = `Token ${token}`;
  }
  const res = await fetch(`${BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.detail || 'Error de red');
  }
  return res.json();
}

export function loginUser(username, password) {
  return api('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function fetchTipos(query = '') {
  const q = query ? `?search=${encodeURIComponent(query)}` : '';
  return api(`/tipos/${q}`);
}
