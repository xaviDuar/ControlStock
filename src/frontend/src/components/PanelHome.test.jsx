import { describe, test, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import PanelHome from './PanelHome';

afterEach(cleanup);

describe('PanelHome', () => {
  test('muestra el título como encabezado de nivel 3 y su contenido', () => {
    render(<PanelHome titulo="Vencimientos próximos"><p>contenido</p></PanelHome>);
    expect(screen.getByRole('heading', { name: 'Vencimientos próximos', level: 3 })).toBeTruthy();
    expect(screen.getByText('contenido')).toBeTruthy();
  });
});
