type Props = {
  sender: string;
  text: string;
  status: string;
};

export function MessageCard({ sender, text, status }: Props) {
  return (
    <div className="card space-y-1">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{sender}</p>
        <span className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10">{status}</span>
      </div>
      <p className="text-textSecondary text-sm leading-relaxed">{text}</p>
    </div>
  );
}
