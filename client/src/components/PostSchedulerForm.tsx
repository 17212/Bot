import { useState } from 'react';

const frequencies = ['once', 'daily', 'weekly', 'monthly'] as const;

type Props = {
  onSubmit?: (payload: { message: string; scheduledFor: string; scheduleType: string }) => void;
};

export function PostSchedulerForm({ onSubmit }: Props) {
  const [message, setMessage] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [scheduleType, setScheduleType] = useState<(typeof frequencies)[number]>('once');

  return (
    <form
      className="card space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.({ message, scheduledFor, scheduleType });
      }}
    >
      <div>
        <label className="text-sm text-textSecondary">Message</label>
        <textarea
          className="w-full mt-1 rounded-xl bg-white/5 border border-white/10 p-3 text-sm focus:border-accent outline-none"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="أدخل المحتوى..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-textSecondary">Scheduled for</label>
          <input
            type="datetime-local"
            className="w-full mt-1 rounded-xl bg-white/5 border border-white/10 p-3 text-sm focus:border-accent outline-none"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-textSecondary">Frequency</label>
          <select
            className="w-full mt-1 rounded-xl bg-white/5 border border-white/10 p-3 text-sm focus:border-accent outline-none"
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value as any)}
          >
            {frequencies.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" className="btn-primary w-full">
        Save Schedule
      </button>
    </form>
  );
}
