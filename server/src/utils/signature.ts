import crypto from 'crypto';
import { env } from '../env';

export function verifyFacebookSignature(body: Buffer, signatureHeader?: string): boolean {
  if (!signatureHeader) return false;
  const [algo, signature] = signatureHeader.split('=');
  if (algo !== 'sha256' || !signature) return false;
  const expected = crypto
    .createHmac('sha256', env.FACEBOOK_APP_SECRET)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
