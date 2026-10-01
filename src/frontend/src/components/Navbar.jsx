import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">¿CUÁNDO VENCE?</Link>
        <ul className="nav-menu">
          <li><Link to="/">Inicio</Link></li>
          {user ? (
            <>
              <li><Link to="/inventario">Inventario</Link></li>
              <li><Link to="/rotulos">Rótulos</Link></li>
              <li><button onClick={logout}>Salir ({user.username})</button></li>
            </>
          ) : (
            <li><Link to="/">Acceder</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
}
