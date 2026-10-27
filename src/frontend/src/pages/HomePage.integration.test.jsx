import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal();
  return { ...mod, useNavigate: vi.fn() };
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.clearAllMocks();
  useAuth.mockReturnValue({ user: null, login: vi.fn(), loading: false });
  useNavigate.mockReturnValue(vi.fn());
});

describe('REQ-LOGIN-03 RF-3.7 fallo de red real (client.js sin mock)', () => {
  test('CA-3.7 extremo a extremo: fetch que falla muestra Error de red con su ayuda', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acceder' }));

    const alerta = await screen.findByRole('alert');
    expect(alerta.textContent).toContain('Error de red');
    expect(alerta.textContent).toContain('Revisá tu conexión e intentá de nuevo.');
    expect(alerta.textContent).not.toContain('Failed to fetch');
  });
});
