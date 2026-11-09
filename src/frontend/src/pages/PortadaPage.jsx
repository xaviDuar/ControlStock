import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/client';
import EyeToggleBtn from '../components/EyeToggleBtn';
import logo from '../assets/logo.png';

const FIELD_MSG = 'Por favor, rellená este campo.';
const NO_MISSING = { username: false, password: false };

export default function PortadaPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [missing, setMissing] = useState(NO_MISSING);
  const [marked, setMarked] = useState(NO_MISSING);
  const [showWarnBox, setShowWarnBox] = useState(false);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  function handleUsernameChange(e) {
    setUsername(e.target.value);
    if (marked.username && e.target.value.trim() !== '') {
      setMarked(m => ({ ...m, username: false }));
    }
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    if (marked.password && e.target.value.trim() !== '') {
      setMarked(m => ({ ...m, password: false }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setShowWarnBox(false);
    const faltan = {
      username: username.trim() === '',
      password: password.trim() === '',
    };
    if (faltan.username || faltan.password) {
      setMissing(faltan);
      setMarked(faltan);
      setShowWarnBox(faltan.username && faltan.password);
      (faltan.username ? usernameRef : passwordRef).current.focus();
      return;
    }
    setMissing(NO_MISSING);
    setMarked(NO_MISSING);
    try {
      const data = await loginUser(username, password);
      login(data.token, { username: data.username });
      navigate('/home');
    } catch (err) {
      const esRed = err.message === 'Error de red';
      setError({
        title: err.message,
        hint: esRed
          ? 'Revisá tu conexión e intentá de nuevo.'
          : 'Revisá el usuario y la contraseña e intentá de nuevo.',
      });
    }
  }

  // Un solo campo faltante: mensaje por campo. Dos faltantes: solo la caja
  // general (Task 5) — los mensajes individuales no se muestran.
  const unSoloFaltante = missing.username !== missing.password;
  const msgUsername = unSoloFaltante && missing.username;
  const msgPassword = unSoloFaltante && missing.password;

  return (
    <div className="hero">
      <div className="hero-logo">
        <img src={logo} alt="¿Cuándo Vence?" />
      </div>
      <h1>¿CUÁNDO VENCE?</h1>
      <p className="hero-sub">Control de vencimientos de productos perecederos</p>
      <div className="pixel-line"></div>

      {user ? (
        <Navigate to="/home" replace />
      ) : (
        <form onSubmit={handleSubmit} className="login-form card">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input type="text" id="username" placeholder="Ingresá tu usuario"
              className={marked.username ? 'input-error' : undefined}
              aria-describedby={msgUsername ? 'msg-username' : undefined}
              ref={usernameRef}
              value={username} onChange={handleUsernameChange} />
            {msgUsername && (
              <p className="field-msg" id="msg-username" role="alert">{FIELD_MSG}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-wrap">
              <input type={showPassword ? 'text' : 'password'} id="password" placeholder="Ingresá tu contraseña"
                className={marked.password ? 'input-error' : undefined}
                aria-describedby={msgPassword ? 'msg-password' : undefined}
                ref={passwordRef}
                value={password} onChange={handlePasswordChange} />
              <EyeToggleBtn visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
            </div>
            {msgPassword && (
              <p className="field-msg" id="msg-password" role="alert">{FIELD_MSG}</p>
            )}
          </div>
          {showWarnBox && (
            <div className="warn-box" role="alert">
              <p className="warn-title">Campos incompletos</p>
              <p className="warn-hint">Por favor, completá los campos solicitados.</p>
            </div>
          )}
          {error && (
            <div className="error-box" role="alert">
              <p className="error-title">{error.title}</p>
              <p className="error-hint">{error.hint}</p>
            </div>
          )}
          <button type="submit" style={{ width: '100%' }}>Acceder</button>
        </form>
      )}
    </div>
  );
}
