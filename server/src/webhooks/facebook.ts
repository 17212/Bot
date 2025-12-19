import type { Request, Response } from 'express';
import { fbComments, fbMessages } from '../../drizzle/schema';
import { env } from '../env';
import { db } from '../db';
import { logger } from '../logger';
import { FacebookService } from '../services/facebook';
import { GeminiService } from '../services/gemini';
import { verifyFacebookSignature } from '../utils/signature';

const gemini = new GeminiService();
const facebook = new FacebookService();

export async function facebookWebhook(req: Request, res: Response) {
  const rawBody = (req as any).rawBody as Buffer | undefined;
  if (!rawBody) return res.status(400).send('Missing body');

  const signature = req.get('x-hub-signature-256');
  if (!verifyFacebookSignature(rawBody, signature)) {
    return res.status(401).send('Invalid signature');
  }

  const body = req.body;
  if (body.object !== 'page') {
    return res.status(400).send('Unsupported object');
  }

  for (const entry of body.entry ?? []) {
    // Comments
    for (const change of entry.changes ?? []) {
      if (change.field === 'feed' && change.value?.item === 'comment') {
        const commentId = change.value.comment_id;
        const message = change.value.message;
        const from = change.value.from?.name ?? 'User';
        const [record] = await db
          .insert(fbComments)
          .values({
            fbCommentId: commentId,
            message,
            fromName: from,
            status: 'new',
          })
          .returning();

        const persona: any = 'friendly';
        const reply = await gemini.generate({
          prompt: message,
          persona,
          language: 'ar',
        });
        await facebook.replyToComment({ commentId, message: reply });
        await db
          .update(fbComments)
          .set({ status: 'answered', repliedAt: new Date() })
          .where(fbComments.id.eq(record.id));
      }
    }

    // Messages
    for (const messaging of entry.messaging ?? []) {
      const senderId = messaging.sender?.id;
      const text = messaging.message?.text;
      if (!senderId || !text) continue;
      await db
        .insert(fbMessages)
        .values({
          fbMessageId: messaging.message.mid,
          conversationId: 1,
          senderId,
          text,
          status: 'new',
        })
        .returning();
      const reply = await gemini.generate({
        prompt: text,
        persona: 'friendly',
        language: 'ar',
      });
      await facebook.replyToMessage({ recipientId: senderId, message: reply });
    }
  }

  return res.status(200).send('EVENT_RECEIVED');
}

export function facebookWebhookVerify(req: Request, res: Response) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === env.FACEBOOK_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send('Verification failed');
}
