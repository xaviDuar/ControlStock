export default function PanelHome({ titulo, children, className = '' }) {
  return (
    <section className={`panel ${className}`.trim()}>
      <h3 className="panel-title">{titulo}</h3>
      {children}
    </section>
  );
}
