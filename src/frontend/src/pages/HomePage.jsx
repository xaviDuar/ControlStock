import { useEffect, useState } from 'react';
import FotoPerfil from '../components/FotoPerfil';
import PanelHome from '../components/PanelHome';
import { useAuth } from '../context/AuthContext';
import { fetchMe } from '../api/client';

export default function HomePage() {
  const { user } = useAuth();
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    fetchMe().then((me) => setFoto(me.foto_perfil)).catch(() => setFoto(null));
  }, []);

  return (
    <div className="home-main">
      <h1 className="home-title">Home</h1>
      <section className="welcome-card">
        <FotoPerfil foto={foto} />
        <div className="saludo">
          <span className="saludo-hola">Hola,</span>
          <span className="saludo-nombre">{user?.username}</span>
        </div>
      </section>
      <section className="resumen">
        <h2 className="resumen-title">Resumen del local</h2>
        <div className="resumen-cols">
          <PanelHome titulo="Vencimientos próximos" className="panel--vencimientos">
            <p className="panel-aviso">por implementar próximamente</p>
          </PanelHome>
          <PanelHome titulo="Último desperdicio" className="panel--desperdicio">
            <p className="panel-aviso">por implementar próximamente</p>
          </PanelHome>
        </div>
      </section>
    </div>
  );
}
