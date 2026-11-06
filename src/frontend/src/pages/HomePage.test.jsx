import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { useAuth } from '../context/AuthContext';
import { fetchMe } from '../api/client';

vi.mock('../api/client', () => ({ fetchMe: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  useAuth.mockReturnValue({ user: { username: 'admin' }, loading: false });
});

describe('REQ-HOME-01 bienvenida', () => {
  test('CA-1.4 con foto configurada el recuadro muestra esa foto (URL absoluta tal cual)', async () => {
    fetchMe.mockResolvedValue({ id: 1, username: 'admin', foto_perfil: 'http://127.0.0.1:8000/media/perfiles/a.png' });
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const img = await screen.findByRole('img', { name: 'Foto de perfil' });
    expect(img.src).toBe('http://127.0.0.1:8000/media/perfiles/a.png');
  });

  test('CA-1.5 sin foto muestra el avatar genérico pixel-art', async () => {
    fetchMe.mockResolvedValue({ id: 1, username: 'admin', foto_perfil: null });
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(await screen.findByRole('img', { name: 'Avatar genérico pixel-art' })).toBeTruthy();
  });

  test('CA-1.6 saludo "Hola," + nombre de usuario a la derecha de la foto', async () => {
    fetchMe.mockResolvedValue({ id: 1, username: 'admin', foto_perfil: null });
    const { container } = render(<MemoryRouter><HomePage /></MemoryRouter>);
    await screen.findByRole('img', { name: 'Avatar genérico pixel-art' });

    const hola = screen.getByText('Hola,');
    const nombre = screen.getByText('admin');
    const foto = container.querySelector('.foto-perfil');
    const saludo = container.querySelector('.saludo');
    expect(foto.compareDocumentPosition(saludo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(hola.compareDocumentPosition(nombre) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('CA-1.5b si fetchMe falla igual muestra avatar genérico y saludo', async () => {
    fetchMe.mockRejectedValue(new Error('Error de red'));
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(await screen.findByRole('img', { name: 'Avatar genérico pixel-art' })).toBeTruthy();
    expect(screen.getByText('Hola,')).toBeTruthy();
    expect(screen.getByText('admin')).toBeTruthy();
  });
});
