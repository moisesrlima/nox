import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import cookie from 'cookie';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const tokensStr = cookies.google_tokens;

    if (!tokensStr) {
      return res.json({ authenticated: false });
    }

    const tokens = JSON.parse(tokensStr);
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const redirectUri = `${protocol}://${host}/api/auth/callback`;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();

    res.json({
      authenticated: true,
      user: {
        name: userInfo.data.name,
        email: userInfo.data.email,
        picture: userInfo.data.picture
      }
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
    res.json({ authenticated: false });
  }
}
