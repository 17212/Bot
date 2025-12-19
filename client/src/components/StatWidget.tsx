type Props = {
  label: string;
  value: number | string;
  accent?: boolean;
};

export function StatWidget({ label, value, accent }: Props) {
  return (
    <div className="card">
      <p className="text-textSecondary text-sm">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent ? 'text-accent' : ''}`}>{value}</p>
    </div>
  );
}
