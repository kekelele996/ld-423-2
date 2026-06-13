interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export const StatCard = ({ label, value, hint }: StatCardProps) => (
  <article className="stat-card">
    <span>{label}</span>
    <strong>{typeof value === 'number' ? value.toFixed(3) : value}</strong>
    {hint ? <small>{hint}</small> : null}
  </article>
);
