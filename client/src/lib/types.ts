export type Persona = 'entertaining' | 'formal' | 'sarcastic' | 'friendly' | 'professional';

export type BotSettings = {
  pageId: string;
  accessToken: string;
  verifyToken: string;
  appSecret: string;
  persona: Persona;
  autoReplyComments: boolean;
  autoReplyMessages: boolean;
  language: 'ar' | 'en';
};
