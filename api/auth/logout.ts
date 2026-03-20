import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie', [
    'google_tokens=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0'
  ]);

  res.json({ success: true });
}
