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
    expect(screen.getByText('¿CUÁNDO VENCE?')).toBeTruthy();
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

  test('los inputs conservan sus placeholders', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByLabelText('Usuario').placeholder).toBe('Ingresá tu usuario');
    expect(screen.getByLabelText('Contraseña').placeholder).toBe('Ingresá tu contraseña');
  });

  test('CA-1.4 UC-01.3 con sesión iniciada muestra atajos y no el formulario', () => {
    useAuth.mockReturnValue({ user: { username: 'admin' }, login: vi.fn(), loading: false });
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText('Ir al Inventario')).toBeTruthy();
    expect(screen.getByText('Crear Rótulos')).toBeTruthy();
    expect(screen.queryByLabelText('Usuario')).toBeNull();
  });
});

describe('REQ-LOGIN-01 RF-1.9/1.10 botón de ojo', () => {
  test('CA-1.5 el ojo muestra el valor sin perder lo escrito y cambia el aria-label', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const password = screen.getByLabelText('Contraseña');
    fireEvent.change(password, { target: { value: 'secreta' } });
    expect(password.type).toBe('password');

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(password.type).toBe('text');
    expect(password.value).toBe('secreta');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeTruthy();
  });

  test('CA-1.6 vuelve a enmascarar conservando el valor', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const password = screen.getByLabelText('Contraseña');
    fireEvent.change(password, { target: { value: 'secreta' } });
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(password.type).toBe('password');
    expect(password.value).toBe('secreta');
  });

  test('el botón de ojo no envía el formulario', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(loginUser).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('REQ-LOGIN-02 validación de campos vacíos', () => {
  test('CA-2.1/2.7 un solo campo vacío: mensaje debajo de ese input y ningún request', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acceder' }));

    const alertas = screen.getAllByRole('alert');
    expect(alertas).toHaveLength(1);
    expect(alertas[0].textContent).toBe('Por favor, rellená este campo.');
    const password = screen.getByLabelText('Contraseña');
    expect(password.closest('.form-group').contains(alertas[0])).toBe(true);
    expect(loginUser).not.toHaveBeenCalled();
  });

  test('CA-2.2 el mensaje va debajo del campo vacío y el foco pasa a él', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreta' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acceder' }));

    const alerta = screen.getByRole('alert');
    const usuario = screen.getByLabelText('Usuario');
    expect(usuario.closest('.form-group').contains(alerta)).toBe(true);
    expect(document.activeElement).toBe(usuario);
    expect(loginUser).not.toHaveBeenCalled();
  });

  test('CA-2.4 el input faltante queda con borde ámbar y conserva el placeholder', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreta' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acceder' }));

    const usuario = screen.getByLabelText('Usuario');
    expect(usuario.className).toContain('input-error');
    expect(usuario.placeholder).toBe('Ingresá tu usuario');
  });

  test('CA-2.5/2.6 completar y reintentar limpia los mensajes y el envío procede', async () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acceder' }));
    expect(screen.getByText('Por favor, rellená este campo.')).toBeTruthy();

    loginUser.mockResolvedValue({ token: 't1', username: 'admin' });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acceder' }));

    await waitFor(() => expect(loginUser).toHaveBeenCalledWith('admin', 'secret123'));
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  test('RF-2.3 el borde ámbar se limpia al escribir pero el mensaje persiste', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acceder' }));
    const password = screen.getByLabelText('Contraseña');
    expect(password.className).toContain('input-error');

    fireEvent.change(password, { target: { value: 'x' } });
    expect(password.className).not.toContain('input-error');
    expect(screen.getByText('Por favor, rellená este campo.')).toBeTruthy();
  });

  test('RF-2.5 ya no hay validación nativa', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    for (const el of [screen.getByLabelText('Usuario'), screen.getByLabelText('Contraseña')]) {
      expect(el.required).toBe(false);
      expect(el.getAttribute('required')).toBeNull();
    }
  });

  test('con Enter en un input vacío tampoco se emite request', () => {
    const { container } = render(<MemoryRouter><HomePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } });
    fireEvent.submit(container.querySelector('form'));
    expect(loginUser).not.toHaveBeenCalled();
  });

  test('un valor de solo espacios cuenta como vacío', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: '   ' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreta' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acceder' }));

    const alerta = screen.getByRole('alert');
    expect(alerta.textContent).toBe('Por favor, rellená este campo.');
    expect(screen.getByLabelText('Usuario').closest('.form-group').contains(alerta)).toBe(true);
    expect(loginUser).not.toHaveBeenCalled();
  });
});
