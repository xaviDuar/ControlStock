import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/client';

vi.mock('../api/client', () => ({
  loginUser: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal();
  return { ...mod, useNavigate: vi.fn() };
});

const navigate = vi.fn();

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  useAuth.mockReturnValue({ user: null, login: vi.fn(), loading: false });
  useNavigate.mockReturnValue(navigate);
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

describe('REQ-LOGIN-03 caja de error de login', () => {
  test('CA-3.1/3.2 credenciales inválidas muestran caja con título y ayuda entre contraseña y botón', async () => {
    loginUser.mockRejectedValue(new Error('Credenciales inválidas'));
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'mala' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acceder' }));

    const alerta = await screen.findByRole('alert');
    expect(alerta.textContent).toContain('Credenciales inválidas');
    expect(alerta.textContent).toContain('Revisá el usuario y la contraseña e intentá de nuevo.');

    const password = screen.getByLabelText('Contraseña');
    const boton = screen.getByRole('button', { name: 'Acceder' });
    expect(password.compareDocumentPosition(alerta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(alerta.compareDocumentPosition(boton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('CA-3.3 conserva los datos ingresados tras el error', async () => {
    loginUser.mockRejectedValue(new Error('Credenciales inválidas'));
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'mala' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acceder' }));

    await screen.findByRole('alert');
    expect(screen.getByLabelText('Usuario').value).toBe('admin');
    expect(screen.getByLabelText('Contraseña').value).toBe('mala');
  });

  test('CA-3.4/3.5 la caja desaparece al reintentar y reaparece si falla de nuevo', async () => {
    loginUser.mockRejectedValueOnce(new Error('Credenciales inválidas'));
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'mala' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acceder' }));
    await screen.findByRole('alert');

    let rechazarSegundo;
    loginUser.mockImplementationOnce(() => new Promise((_, reject) => { rechazarSegundo = reject; }));
    fireEvent.click(screen.getByRole('button', { name: 'Acceder' }));
    expect(screen.queryByRole('alert')).toBeNull();

    rechazarSegundo(new Error('Credenciales inválidas'));
    await screen.findByRole('alert');
  });

  test('CA-3.7 fallo de red muestra Error de red con su ayuda', async () => {
    loginUser.mockRejectedValue(new Error('Error de red'));
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreta' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acceder' }));

    const alerta = await screen.findByRole('alert');
    expect(alerta.textContent).toContain('Error de red');
    expect(alerta.textContent).toContain('Revisá tu conexión e intentá de nuevo.');
  });
});

describe('casos de uso de login (regresión)', () => {
  test('CA-1.3 UC-01.2 login válido guarda sesión y navega a /inventario', async () => {
    const login = vi.fn();
    useAuth.mockReturnValue({ user: null, login, loading: false });
    loginUser.mockResolvedValue({ token: 't1', username: 'admin' });
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acceder' }));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/inventario'));
    expect(loginUser).toHaveBeenCalledWith('admin', 'secret123');
    expect(login).toHaveBeenCalledWith('t1', { username: 'admin' });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  test('CA-2.1/2.4 REQ-02 ambos campos son requeridos con sus placeholders', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const usuario = screen.getByLabelText('Usuario');
    const password = screen.getByLabelText('Contraseña');
    expect(usuario.required).toBe(true);
    expect(usuario.placeholder).toBe('Ingresá tu usuario');
    expect(password.required).toBe(true);
    expect(password.placeholder).toBe('Ingresá tu contraseña');
  });

  test('CA-1.4 UC-01.3 con sesión iniciada muestra atajos y no el formulario', () => {
    useAuth.mockReturnValue({ user: { username: 'admin' }, login: vi.fn(), loading: false });
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText('Ir al Inventario')).toBeTruthy();
    expect(screen.getByText('Crear Rótulos')).toBeTruthy();
    expect(screen.queryByLabelText('Usuario')).toBeNull();
  });
});
