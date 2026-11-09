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

  test('className agrega el modificador "panel panel--x" y omitido deja exactamente "panel"', () => {
    const { container: conClassName } = render(<PanelHome titulo="Vencimientos próximos" className="panel--x"><p>contenido</p></PanelHome>);
    expect(conClassName.querySelector('section').className).toBe('panel panel--x');
    const { container: sinClassName } = render(<PanelHome titulo="Último desperdicio"><p>contenido</p></PanelHome>);
    expect(sinClassName.querySelector('section').className).toBe('panel');
  });
});
