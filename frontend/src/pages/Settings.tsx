import { useState } from "react";
import { toast } from "sonner";
import { useBotStore } from "@/store/useBotStore";

function Settings() {
  const { settings, setSystemPrompt, updateSettings } = useBotStore();
  const [systemPrompt, setSystemPromptLocal] = useState(settings.systemPrompt);
  const [autoComments, setAutoComments] = useState(settings.autoComments);
  const [autoMessages, setAutoMessages] = useState(settings.autoMessages);
  const [language, setLanguage] = useState<"ar" | "en">(settings.language);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSystemPrompt(systemPrompt);
    updateSettings({ autoComments, autoMessages, language });
    toast.success("Settings saved (using built-in credentials; tokens hidden).");
  };

  return (
    <div className="space-y-4">
      <div className="text-heading font-heading text-2xl">Settings</div>
      <p className="text-body text-sm">
        System prompt and auto-reply controls. Facebook tokens are embedded; no manual entry needed.
      </p>

      <form
        onSubmit={handleSave}
        className="glass-panel rounded-2xl p-5 border border-white/8 space-y-4 text-sm text-body"
      >
        <div className="grid md:grid-cols-2 gap-3">
          <label className="space-y-1 md:col-span-2">
            <span className="text-body/80">System Prompt (AI persona)</span>
            <textarea
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-body focus:border-primary/60 focus:outline-none"
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPromptLocal(e.target.value)}
              placeholder="Instructions for the bot tone/persona..."
            />
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoComments}
                onChange={(e) => setAutoComments(e.target.checked)}
                className="accent-primary"
              />
              <span>Auto-reply to comments</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoMessages}
                onChange={(e) => setAutoMessages(e.target.checked)}
                className="accent-primary"
              />
              <span>Auto-reply to Messenger</span>
            </label>
            <label className="space-y-1 block">
              <span className="text-body/80">Language</span>
              <select
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-body focus:border-primary/60 focus:outline-none"
                value={language}
                onChange={(e) => setLanguage(e.target.value as "ar" | "en")}
              >
                <option value="ar">Arabic</option>
                <option value="en">English</option>
              </select>
            </label>
            <div className="text-xs text-body/60">
              System prompt applies to all AI replies (comments + Messenger).
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/60 text-primary font-semibold"
          >
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
