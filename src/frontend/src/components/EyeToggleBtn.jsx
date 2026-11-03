export default function EyeToggleBtn({ visible, onToggle }) {
  return (
    <button
      type="button"
      className="eye-toggle"
      aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      onClick={onToggle}
    >
      <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true" shapeRendering="crispEdges">
        <path d="M1 8 L4 4 H12 L15 8 L12 12 H4 Z" fill="none" stroke="#4aaa8a" strokeWidth="1.5" />
        {visible ? (
          <path d="M3 3 L13 13" stroke="#4aaa8a" strokeWidth="1.5" />
        ) : (
          <rect x="7" y="7" width="2" height="2" fill="#4aaa8a" />
        )}
      </svg>
    </button>
  );
}
