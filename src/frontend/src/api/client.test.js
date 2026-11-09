import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchMe } from './client';

describe('fetchMe', () => {
  beforeEach(() => {
    localStorage.setItem('auth', JSON.stringify({ token: 't1', user: { username: 'admin' } }));
  });
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  test('pide GET /api/auth/me/ con el token y devuelve la cuenta', async () => {
    const cuenta = { id: 1, username: 'admin', foto_perfil: 'http://127.0.0.1:8000/media/perfiles/a.png' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => cuenta }));

    await expect(fetchMe()).resolves.toEqual(cuenta);
    expect(fetch).toHaveBeenCalledWith('/api/auth/me/', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Token t1' }),
    }));
  });

  test('propaga el error del backend como Error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ detail: 'No encontrado.' }) }));
    await expect(fetchMe()).rejects.toThrow('No encontrado.');
  });
});
