import { useState, useEffect } from 'react';
import { fetchTipos } from '../api/client';

export default function RotulosPage() {
  const [tipos, setTipos] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTipos()
      .then(data => setTipos(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function addToCart(id, nombre) {
    const fecha = dates[id];
    if (!fecha) { alert('Por favor seleccioná una fecha de elaboración.'); return; }
    const key = `${nombre}__${fecha}`;
    if (cartItems[key]) { alert('Este producto con esa fecha ya está en la lista.'); return; }
    setCartItems(prev => ({ ...prev, [key]: { nombre, fecha } }));
    setDates(prev => ({ ...prev, [id]: '' }));
  }

  function removeFromCart(key) {
    setCartItems(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  const entries = Object.entries(cartItems);

  return (
    <div>
      <h1>Crear Rótulos</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.85rem' }}>
        Seleccioná los productos, asignales una fecha de elaboración y generá los rótulos para imprimir.
      </p>

      {error && <div className="message error">{error}</div>}

      <div className="cart-layout">
        <div>
          <h2>Productos disponibles</h2>
          {loading && <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>}
          <div className="product-grid">
            {tipos.map(t => (
              <div className="product-card" key={t.id_tipo_producto}>
                <h3>{t.nombre}</h3>
                <div className="venc-item"><strong>Ref:</strong> {t.vencimiento_refrigerado || '—'}</div>
                <div className="venc-item"><strong>Cong:</strong> {t.vencimiento_congelado || '—'}</div>
                <div className="venc-item"><strong>Bod:</strong> {t.vencimiento_bodega || '—'}</div>
                <div className="venc-item"><strong>Top:</strong> {t.vencimiento_toppinera || '—'}</div>
                <div className="add-date-form">
                  <input type="date" value={dates[t.id_tipo_producto] || ''}
                    onChange={e => setDates(prev => ({ ...prev, [t.id_tipo_producto]: e.target.value }))} />
                  <button onClick={() => addToCart(t.id_tipo_producto, t.nombre)}>+ Agregar</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-sidebar">
          <h2>Lista para rótulos</h2>
          {entries.length === 0 ? (
            <div className="cart-empty">Aún no agregaste productos.<br />Seleccioná uno de la lista.</div>
          ) : (
            <>
              {entries.map(([key, item]) => (
                <div className="cart-item" key={key}>
                  <div className="cart-item-info">
                    <div className="cart-product-name">{item.nombre}</div>
                    <div className="cart-date">Elab: {item.fecha || '—'}</div>
                  </div>
                  <button className="btn-remove" onClick={() => removeFromCart(key)}
                    style={{ background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>X</button>
                </div>
              ))}
              <div className="cart-total">
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                  {entries.length} producto(s) seleccionado(s)
                </p>
                <button className="btn" style={{ width: '100%' }} onClick={() => alert('¡Rótulos generados! (Funcionalidad en desarrollo)')}>
                  Crear Rótulos
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
