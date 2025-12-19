import { env } from '../env';

type Persona =
  | 'entertaining'
  | 'formal'
  | 'sarcastic'
  | 'friendly'
  | 'professional';

type GenerateParams = {
  prompt: string;
  persona: Persona;
  language: 'ar' | 'en';
  context?: string;
};

const personaPrompts: Record<Persona, string> = {
  entertaining: 'ردود مرحة وذكية مع تعليقات فكاهية.',
  formal: 'ردود رسمية ومحترمة ومباشرة.',
  sarcastic: 'ردود ساخرة بذكاء دون إساءة.',
  friendly: 'ردود ودودة ومرحبة وتقدّر وقت المستخدم.',
  professional: 'ردود موثوقة ومركزة على المعلومات.',
};

export class GeminiService {
  async generate({ prompt, persona, language, context }: GenerateParams) {
    const systemPrompt = `${personaPrompts[persona]} اللغة: ${language === 'ar' ? 'العربية' : 'English'}. ${
      context ?? ''
    }`;

    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
          },
        ],
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message ?? 'Gemini generation failed');
    }
    const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ?? '...';
  }
}
