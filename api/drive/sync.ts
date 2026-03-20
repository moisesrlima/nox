import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import cookie from 'cookie';

const SYNC_FILE_NAME = 'nox_note_sync.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const tokensStr = cookies.google_tokens;

  if (!tokensStr) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
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

    // Handle token refresh
    oauth2Client.on('tokens', (newTokens) => {
      const updatedTokens = { ...tokens, ...newTokens };
      res.setHeader('Set-Cookie', [
        `google_tokens=${JSON.stringify(updatedTokens)}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${30 * 24 * 60 * 60}`
      ]);
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    if (req.method === 'POST') {
      // Upload/Update
      const { data } = req.body;

      const searchRes = await drive.files.list({
        q: `name='${SYNC_FILE_NAME}' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id)',
      });

      const files = searchRes.data.files;
      const fileMetadata = {
        name: SYNC_FILE_NAME,
        mimeType: 'application/json',
      };
      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(data),
      };

      if (files && files.length > 0) {
        const fileId = files[0].id!;
        await drive.files.update({
          fileId,
          media,
        });
      } else {
        await drive.files.create({
          requestBody: fileMetadata,
          media,
          fields: 'id',
        });
      }

      res.json({ success: true, message: 'Data synced successfully' });
    } else if (req.method === 'GET') {
      // Download
      const searchRes = await drive.files.list({
        q: `name='${SYNC_FILE_NAME}' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id)',
      });

      const files = searchRes.data.files;
      if (!files || files.length === 0) {
        return res.json({ data: null, message: 'No sync file found' });
      }

      const fileId = files[0].id!;
      const fileRes = await drive.files.get({
        fileId,
        alt: 'media',
      }, { responseType: 'json' });

      res.json({ data: fileRes.data });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error syncing data:', error);
    res.status(500).json({ error: 'Failed to sync data' });
  }
}
