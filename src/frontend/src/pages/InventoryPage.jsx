import { useState, useEffect } from 'react';
import { fetchTipos } from '../api/client';
import DataCell from '../components/DataCell';

export default function InventoryPage() {
  const [tipos, setTipos] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchTipos(query)
      .then(data => setTipos(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [query]);

  const filtered = query
    ? tipos.filter(t => t.nombre.toLowerCase().includes(query.toLowerCase()))
    : tipos;

  return (
    <div>
      <h1>Inventario</h1>
      <div className="search-bar">
        <input type="text" placeholder="Buscar por nombre de producto..."
          value={query} onChange={e => setQuery(e.target.value)} />
        {query && <button className="btn btn-secondary" onClick={() => setQuery('')}>Limpiar</button>}
      </div>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>}
      {error && <div className="message error">{error}</div>}

      {!loading && !error && filtered.length > 0 && (
        <div className="product-list">
          <div className="product-row product-header">
            <span>Producto</span>
            <span>Refrigerado</span>
            <span>Congelado</span>
            <span>Bodega</span>
            <span>Toppinera</span>
            <span>Obs.</span>
          </div>
          {filtered.map(t => (
            <div className="product-row" key={t.id_tipo_producto}>
              <span className="prod-name">{t.nombre}</span>
              <DataCell value={t.vencimiento_refrigerado} />
              <DataCell value={t.vencimiento_congelado} />
              <DataCell value={t.vencimiento_bodega} />
              <DataCell value={t.vencimiento_toppinera} />
              <span className="prod-obs">{t.observaciones || '—'}</span>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && query && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color: 'var(--text-secondary)' }}>No se encontraron productos para "{query}"</p>
          <button className="btn" style={{ marginTop: 16 }} onClick={() => setQuery('')}>Ver todos</button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: 10 }}>
          {filtered.length} tipo(s) de producto
        </p>
      )}
    </div>
  );
}
