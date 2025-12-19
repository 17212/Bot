import { env } from '../env';
import { logger } from '../logger';

type PublishPostParams = {
  message: string;
  mediaUrl?: string;
};

type ReplyCommentParams = {
  commentId: string;
  message: string;
};

type ReplyMessageParams = {
  recipientId: string;
  message: string;
};

const GRAPH = 'https://graph.facebook.com/v19.0';

export class FacebookService {
  constructor(private accessToken: string = env.FACEBOOK_ACCESS_TOKEN, private pageId: string = env.FACEBOOK_PAGE_ID) {}

  async publishPost(params: PublishPostParams) {
    const url = `${GRAPH}/${this.pageId}/feed`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: params.message,
        url: params.mediaUrl,
        access_token: this.accessToken,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      logger.error({ url, json }, 'Failed to publish post');
      throw new Error(json.error?.message ?? 'Failed to publish post');
    }
    return json as { id: string };
  }

  async replyToComment(params: ReplyCommentParams) {
    const url = `${GRAPH}/${params.commentId}/comments`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: params.message,
        access_token: this.accessToken,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      logger.error({ url, json }, 'Failed to reply to comment');
      throw new Error(json.error?.message ?? 'Failed to reply to comment');
    }
    return json as { id: string };
  }

  async replyToMessage(params: ReplyMessageParams) {
    const url = `${GRAPH}/me/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: params.recipientId },
        message: { text: params.message },
        access_token: this.accessToken,
        messaging_type: 'RESPONSE',
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      logger.error({ url, json }, 'Failed to reply to message');
      throw new Error(json.error?.message ?? 'Failed to reply to message');
    }
    return json as { message_id: string };
  }
}
