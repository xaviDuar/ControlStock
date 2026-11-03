import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('REQ-LOGIN-01 RF-1.11 Navbar según el estado de sesión', () => {
  test('CA-1.8 sin sesión no renderiza ninguna barra de navegación', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  test('CA-1.9 con sesión muestra el menú de navegación', () => {
    useAuth.mockReturnValue({ user: { username: 'admin' }, logout: vi.fn() });
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    expect(screen.getByRole('navigation')).toBeTruthy();
    expect(screen.getByText('Inventario')).toBeTruthy();
    expect(screen.getByText('Salir (admin)')).toBeTruthy();
  });
});
