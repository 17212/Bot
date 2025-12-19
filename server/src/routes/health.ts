import type { Request, Response } from 'express';

export function healthHandler(_req: Request, res: Response) {
  return res.json({ status: 'ok', uptime: process.uptime() });
}
