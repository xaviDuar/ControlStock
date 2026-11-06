export default function FotoPerfil({ foto }) {
  return (
    <div className="foto-perfil">
      {foto ? (
        <img src={foto} alt="Foto de perfil" />
      ) : (
        <svg
          className="pixel-avatar"
          viewBox="0 0 64 64"
          role="img"
          aria-label="Avatar genérico pixel-art"
        >
          <rect x="20" y="9" width="24" height="24" fill="#6accaa" />
          <rect x="12" y="37" width="40" height="16" fill="#4aaa8a" />
          <rect x="17" y="51" width="30" height="9" fill="#4aaa8a" />
        </svg>
      )}
    </div>
  );
}
