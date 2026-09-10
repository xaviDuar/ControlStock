export default function DataCell({ value }) {
  return (
    <span className="venc-cell">
      {value ? <span className="has-data"></span> : <span className="no-data"></span>}
      {value || '—'}
    </span>
  );
}
