import { useState, useEffect } from 'react';
import { fetchTipos } from '../api/client';

const METODOS = [
  { id: 'refrigerado', label: 'Refrigerado' },
  { id: 'congelado', label: 'Congelado' },
  { id: 'bodega', label: 'Bodega' },
  { id: 'toppinera', label: 'Toppinera' },
];

function formatearCondicion(c) {
  if (c.especial === 'PROVEEDOR') return 'Fec. de proveedor';
  if (c.especial === 'FIN_DEL_DIA') return 'Fin del día';
  const anot = c.anotacion ? ` (${c.anotacion})` : '';
  return `${c.duracion_valor} ${c.duracion_unidad}${anot}`;
}

function calcularVencimiento(fecha, c) {
  if (!fecha) return null;
  if (c.especial === 'PROVEEDOR') return null;
  const base = new Date(fecha + 'T12:00:00');
  if (c.especial === 'FIN_DEL_DIA') return base;
  const valor = Number(c.duracion_valor);
  const unidad = c.duracion_unidad;
  const v = new Date(base);
  if (unidad === 'HS') v.setHours(v.getHours() + valor);
  else if (unidad === 'DIAS') v.setDate(v.getDate() + valor);
  else if (unidad === 'MESES') v.setMonth(v.getMonth() + valor);
  else if (unidad === 'ANIOS') v.setFullYear(v.getFullYear() + valor);
  else return null;
  return v;
}

function agruparCondiciones(t) {
  return METODOS.map(m => ({
    ...m,
    condiciones: (t.condiciones || []).filter(c => c.metodo === m.id),
  }));
}

export default function RotulosPage() {
  const [tipos, setTipos] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState({});
  const [selected, setSelected] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTipos()
      .then(data => {
        setTipos(data);
        const defaults = {};
        data.forEach(t => {
          defaults[t.id_tipo_producto] = {};
          agruparCondiciones(t).forEach(g => {
            if (g.condiciones.length) defaults[t.id_tipo_producto][g.id] = g.condiciones[0].id_condicion;
          });
        });
        setSelected(defaults);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function addToCart(id, nombre, condiciones) {
    const fecha = dates[id];
    if (!fecha) { alert('Por favor seleccioná una fecha de elaboración.'); return; }
    const key = `${nombre}__${fecha}`;
    if (cartItems[key]) { alert('Este producto con esa fecha ya está en la lista.'); return; }
    setCartItems(prev => ({ ...prev, [key]: { nombre, fecha, condiciones } }));
    setDates(prev => ({ ...prev, [id]: '' }));
  }

  function removeFromCart(key) {
    setCartItems(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function condicionElegida(t, metodoId) {
    const g = agruparCondiciones(t).find(g => g.id === metodoId);
    const id = selected[t.id_tipo_producto]?.[metodoId];
    return g?.condiciones.find(c => c.id_condicion === id) || null;
  }

  const entries = Object.entries(cartItems);

  return (
    <div>
      <h1>Crear Rótulos</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.85rem' }}>
        Seleccioná los productos, asignales fecha de elaboración, elegí la condición de conservación y generá los rótulos.
      </p>

      {error && <div className="message error">{error}</div>}

      <div className="cart-layout">
        <div>
          <h2>Productos disponibles</h2>
          {loading && <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>}
          <div className="product-grid">
            {tipos.map(t => {
              const grupos = agruparCondiciones(t);
              const hayCondiciones = grupos.some(g => g.condiciones.length > 0);
              const fecha = dates[t.id_tipo_producto] || '';
              return (
                <div className="product-card" key={t.id_tipo_producto}>
                  <h3>{t.nombre}</h3>
                  {!hayCondiciones && <div className="venc-item" style={{ color: 'var(--text-secondary)' }}>Sin condiciones de vencimiento</div>}
                  {grupos.filter(g => g.condiciones.length).map(g => {
                    const c = condicionElegida(t, g.id);
                    const vence = calcularVencimiento(fecha, c);
                    return (
                      <div className="venc-item" key={`${t.id_tipo_producto}-${g.id}`}>
                        <strong>{g.label}:</strong>{' '}
                        <select
                          value={selected[t.id_tipo_producto]?.[g.id] ?? ''}
                          onChange={e => setSelected(prev => ({
                            ...prev,
                            [t.id_tipo_producto]: { ...prev[t.id_tipo_producto], [g.id]: Number(e.target.value) },
                          }))}
                        >
                          {g.condiciones.map(cOpt => (
                            <option key={cOpt.id_condicion} value={cOpt.id_condicion}>{formatearCondicion(cOpt)}</option>
                          ))}
                        </select>
                        {fecha && c && vence && (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                            {' '}→ vence {vence.toLocaleDateString('es-AR')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div className="add-date-form">
                    <input type="date" value={fecha}
                      onChange={e => setDates(prev => ({ ...prev, [t.id_tipo_producto]: e.target.value }))} />
                    <button onClick={() => {
                      const condiciones = grupos
                        .filter(g => g.condiciones.length)
                        .map(g => ({ metodo: g.label, texto: formatearCondicion(condicionElegida(t, g.id)) }));
                      addToCart(t.id_tipo_producto, t.nombre, condiciones);
                    }}>+ Agregar</button>
                  </div>
                </div>
              );
            })}
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
                    {item.condiciones?.length > 0 && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {item.condiciones.map(c => (
                          <div key={c.metodo}>{c.metodo}: {c.texto}</div>
                        ))}
                      </div>
                    )}
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