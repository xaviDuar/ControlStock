import { useState, useEffect } from 'react';
import { fetchProductos } from '../api/client';

function formatearCondicion(c) {
  if (!c) return '—';
  if (c.especial === 'PROVEEDOR') return 'Fec. de proveedor';
  if (c.especial === 'FIN_DEL_DIA') return 'Fin del día';
  const anot = c.anotacion ? ` (${c.anotacion})` : '';
  return `${c.duracion_valor} ${c.duracion_unidad}${anot}`;
}

function formatearFecha(f) {
  if (!f) return '—';
  return new Date(f + 'T12:00:00').toLocaleDateString('es-AR');
}

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchProductos(query)
      .then(data => setProductos(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div>
      <h1>Productos</h1>
      <div className="search-bar">
        <input type="text" placeholder="Buscar por nombre o proveedor..."
          value={query} onChange={e => setQuery(e.target.value)} />
        {query && <button className="btn btn-secondary" onClick={() => setQuery('')}>Limpiar</button>}
      </div>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>}
      {error && <div className="message error">{error}</div>}

      {!loading && !error && productos.length > 0 && (
        <div className="product-list">
          <div className="lotes-row lotes-header">
            <span>Producto</span>
            <span>Condición</span>
            <span>Elaboración</span>
            <span>Vencimiento</span>
            <span>Cantidad</span>
            <span>Costo</span>
            <span>Proveedor</span>
          </div>
          {productos.map(p => (
            <div className="lotes-row" key={p.id_producto}>
              <span className="prod-name">{p.nombre}</span>
              <span className="lotes-cond">{formatearCondicion(p.condicion)}</span>
              <span>{formatearFecha(p.fecha_elaboracion)}</span>
              <span>{formatearFecha(p.fecha_vencimiento)}</span>
              <span>{p.cantidad ?? '—'}</span>
              <span>{p.costo_unitario != null ? `$${p.costo_unitario}` : '—'}</span>
              <span className="prod-obs">{p.proveedor || '—'}</span>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && productos.length === 0 && query && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color: 'var(--text-secondary)' }}>No se encontraron productos para "{query}"</p>
          <button className="btn" style={{ marginTop: 16 }} onClick={() => setQuery('')}>Ver todos</button>
        </div>
      )}

      {!loading && !error && productos.length === 0 && !query && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color: 'var(--text-secondary)' }}>No hay productos cargados.</p>
        </div>
      )}

      {!loading && !error && productos.length > 0 && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: 10 }}>
          {productos.length} lote(s) de producto
        </p>
      )}
    </div>
  );
}
