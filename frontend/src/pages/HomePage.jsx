import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/client';

export default function HomePage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await loginUser(username, password);
      login(data.token, { username: data.username });
      navigate('/inventario');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="hero">
      <h1>¿CUÁNDO VENCE?</h1>
      <p className="hero-sub">Control de vencimientos para productos perecederos</p>
      <div className="pixel-line"></div>
      <p>Gestioná tu inventario, consultá fechas de expiración y generá rótulos de forma simple y organizada.</p>

      {user ? (
        <>
          <button onClick={() => navigate('/inventario')} className="btn">Ir al Inventario</button>
          <button onClick={() => navigate('/rotulos')} className="btn btn-secondary" style={{ marginLeft: 8 }}>Crear Rótulos</button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="login-form card">
          {error && <div className="message error">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input type="text" id="username" placeholder="Ingresá tu usuario" required
              value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" placeholder="Ingresá tu contraseña" required
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" style={{ width: '100%' }}>Acceder</button>
        </form>
      )}
    </div>
  );
}
