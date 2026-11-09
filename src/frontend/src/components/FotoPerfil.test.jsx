import { describe, test, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import FotoPerfil from './FotoPerfil';

afterEach(cleanup);

describe('FotoPerfil', () => {
  test('con foto muestra la imagen con su URL tal cual', () => {
    render(<FotoPerfil foto="http://127.0.0.1:8000/media/perfiles/a.png" />);
    const img = screen.getByRole('img', { name: 'Foto de perfil' });
    expect(img.src).toBe('http://127.0.0.1:8000/media/perfiles/a.png');
    expect(screen.queryByRole('img', { name: 'Avatar genérico pixel-art' })).toBeNull();
  });

  test('sin foto muestra el avatar genérico pixel-art', () => {
    render(<FotoPerfil foto={null} />);
    expect(screen.queryByRole('img', { name: 'Foto de perfil' })).toBeNull();
    expect(screen.getByRole('img', { name: 'Avatar genérico pixel-art' })).toBeTruthy();
  });
});
