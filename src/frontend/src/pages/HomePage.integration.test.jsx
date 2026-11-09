// src/frontend/src/pages/HomePage.integration.test.jsx — client.js y AuthContext reales, solo fetch stubbeado
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { AuthProvider } from '../context/AuthContext';

afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); });
beforeEach(() => {
  localStorage.setItem('auth', JSON.stringify({ token: 't1', user: { username: 'admin' } }));
});

describe('REQ-HOME-01 RNF-1.4 consulta autenticada', () => {
  test('CA-1.4 extremo a extremo: GET /api/auth/me/ con token y la foto se pinta', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, username: 'admin', foto_perfil: 'http://127.0.0.1:8000/media/perfiles/a.png' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<MemoryRouter><AuthProvider><HomePage /></AuthProvider></MemoryRouter>);

    const img = await screen.findByRole('img', { name: 'Foto de perfil' });
    expect(img.src).toBe('http://127.0.0.1:8000/media/perfiles/a.png');
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me/', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Token t1' }),
    }));
  });

  test('CA-1.5b extremo a extremo: fallo de red real muestra avatar genérico y saludo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    render(<MemoryRouter><AuthProvider><HomePage /></AuthProvider></MemoryRouter>);

    expect(await screen.findByRole('img', { name: 'Avatar genérico pixel-art' })).toBeTruthy();
    expect(screen.getByText('Hola,')).toBeTruthy();
    expect(screen.getByText('admin')).toBeTruthy();
  });
});

test('CA-2.3 la única llamada del Home es /api/auth/me/', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: 1, username: 'admin', foto_perfil: null }),
  });
  vi.stubGlobal('fetch', fetchMock);
  render(<MemoryRouter><AuthProvider><HomePage /></AuthProvider></MemoryRouter>);
  await screen.findByRole('img', { name: 'Avatar genérico pixel-art' });

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][0]).toBe('/api/auth/me/');
});
