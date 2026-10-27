import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { useAuth } from '../context/AuthContext';

vi.mock('../api/client', () => ({
  loginUser: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  useAuth.mockReturnValue({ user: null, login: vi.fn(), loading: false });
});

describe('REQ-LOGIN-01 identidad de portada', () => {
  test('CA-1.1 muestra identidad y formulario sin párrafo descriptivo', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByAltText('¿Cuándo Vence?')).toBeTruthy();
    expect(screen.getByText('¿Cuándo Vence?')).toBeTruthy();
    expect(screen.getByText('Control de vencimientos de productos perecederos')).toBeTruthy();
    expect(screen.getByLabelText('Usuario')).toBeTruthy();
    expect(screen.getByLabelText('Contraseña')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Acceder' })).toBeTruthy();
    expect(screen.queryByText(/Gestioná tu inventario/)).toBeNull();
  });
});
