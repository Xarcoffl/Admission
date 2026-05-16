type KpiCardProps = {
  label: string;
  value: string | number;
  accent?: 'success' | 'warning' | 'danger';
};

export default function KpiCard({ label, value, accent }: KpiCardProps) {
  return (
    <div className="kpi-card">
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}
