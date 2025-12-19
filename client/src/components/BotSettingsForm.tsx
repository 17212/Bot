import { useState } from 'react';
import type { BotSettings, Persona } from '../lib/types';

const personas: Persona[] = ['entertaining', 'formal', 'sarcastic', 'friendly', 'professional'];

type Props = {
  initial?: Partial<BotSettings>;
  onSave?: (payload: BotSettings) => void;
};

export function BotSettingsForm({ initial, onSave }: Props) {
  const [form, setForm] = useState<BotSettings>({
    pageId: initial?.pageId ?? '',
    accessToken: initial?.accessToken ?? '',
    verifyToken: initial?.verifyToken ?? '',
    appSecret: initial?.appSecret ?? '',
    persona: initial?.persona ?? 'friendly',
    autoReplyComments: initial?.autoReplyComments ?? true,
    autoReplyMessages: initial?.autoReplyMessages ?? true,
    language: initial?.language ?? 'ar',
  });

  const update = (key: keyof BotSettings, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      className="card space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave?.(form);
      }}
    >
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Page ID">
          <input
            className="input"
            value={form.pageId}
            onChange={(e) => update('pageId', e.target.value)}
            placeholder="1234567890"
          />
        </Field>
        <Field label="Access Token">
          <input
            className="input"
            value={form.accessToken}
            onChange={(e) => update('accessToken', e.target.value)}
            placeholder="EAAB..."
          />
        </Field>
        <Field label="Verify Token">
          <input
            className="input"
            value={form.verifyToken}
            onChange={(e) => update('verifyToken', e.target.value)}
          />
        </Field>
        <Field label="App Secret">
          <input
            className="input"
            value={form.appSecret}
            onChange={(e) => update('appSecret', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Field label="Persona">
          <select className="input" value={form.persona} onChange={(e) => update('persona', e.target.value as Persona)}>
            {personas.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Language">
          <select className="input" value={form.language} onChange={(e) => update('language', e.target.value as 'ar' | 'en')}>
            <option value="ar">Arabic</option>
            <option value="en">English</option>
          </select>
        </Field>
        <Field label="Toggles">
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.autoReplyComments} onChange={(e) => update('autoReplyComments', e.target.checked)} /> Comments
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.autoReplyMessages} onChange={(e) => update('autoReplyMessages', e.target.checked)} /> Messages
            </label>
          </div>
        </Field>
      </div>

      <button type="submit" className="btn-primary w-full">
        Save Settings
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm text-textSecondary space-y-1 block">
      <span>{label}</span>
      {children}
    </label>
  );
}

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    className?: string;
  }
}

const inputStyles = `
  input, select {
    @apply w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm focus:border-accent outline-none;
  }
`;
