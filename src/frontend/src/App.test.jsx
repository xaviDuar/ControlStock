import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import App from './App';

afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); });

describe('REQ-HOME-01 rutas', () => {
  test('CA-1.2 sin sesión /home redirige a la portada de acceso', () => {
    window.history.pushState({}, '', '/home');
    render(<App />);
    expect(screen.getByLabelText('Usuario')).toBeTruthy();
  });

  test('CA-1.3 con sesión / redirige a /home', async () => {
    localStorage.setItem('auth', JSON.stringify({ token: 't1', user: { username: 'admin' } }));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ id: 1, username: 'admin', foto_perfil: null }),
    }));
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(await screen.findByRole('img', { name: 'Avatar genérico pixel-art' })).toBeTruthy();
  });
});
