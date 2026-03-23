import 'dotenv/config';
import express from 'express';
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';
import path from 'path';

console.log('Server starting... Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  hasClientId: !!(process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID),
  hasRedirectUri: !!process.env.GOOGLE_REDIRECT_URI
});

// Centralized Config
const googleConfig = {
  get clientId() { return process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID; },
  get clientSecret() { return process.env.GOOGLE_CLIENT_SECRET || process.env.VITE_GOOGLE_CLIENT_SECRET; },
  get redirectUri() { return process.env.GOOGLE_REDIRECT_URI; }
};

// Validation function
function validateEnv() {
  const { clientId, clientSecret } = googleConfig;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID não definido no ambiente.");
  if (!clientSecret) throw new Error("GOOGLE_CLIENT_SECRET não definido no ambiente.");
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Diagnostic route
app.get('/api/test', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers.host || req.get('host');
  
  res.json({ 
    status: 'ok', 
    version: '1.0.3',
    timestamp: new Date().toISOString(),
    env: { 
      hasClientId: !!googleConfig.clientId, 
      hasClientSecret: !!googleConfig.clientSecret,
      hasRedirectUri: !!googleConfig.redirectUri,
      clientIdValue: googleConfig.clientId ? `${googleConfig.clientId.substring(0, 10)}...` : 'MISSING',
      redirectUriValue: googleConfig.redirectUri || 'DYNAMIC',
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV
    },
    request: {
      protocol,
      host,
      url: req.url,
      method: req.method,
      headers: {
        'x-forwarded-proto': req.headers['x-forwarded-proto'],
        'host': req.headers['host'],
        'x-vercel-id': req.headers['x-vercel-id']
      }
    }
  });
});

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', time: new Date().toISOString() });
});

// OAuth2 Client setup
const getOAuth2Client = (req: express.Request) => {
  validateEnv();

  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers.host || req.get('host');
  
  // Use explicit redirect URI if provided, otherwise fallback to dynamic
  const redirectUri = googleConfig.redirectUri || `${protocol}://${host}/auth/callback`;
  
  console.log('Creating OAuth2 client with redirectUri:', redirectUri);

  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    redirectUri
  );
};

// 1. Get Auth URL
app.get('/api/auth/url', (req, res) => {
  try {
    const oauth2Client = getOAuth2Client(req);
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // Force to get refresh token
      scope: [
        'https://www.googleapis.com/auth/drive.file', // Only files created by the app
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
    });
    res.json({ url });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ 
      error: 'Falha ao gerar URL de autenticação', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// 2. Auth Callback
app.get(['/auth/callback', '/api/auth/callback'], async (req, res) => {
  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    return res.status(400).send('Missing code');
  }

  try {
    const oauth2Client = getOAuth2Client(req);
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in HTTP-only cookie
    res.cookie('google_tokens', JSON.stringify(tokens), {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Autenticação com sucesso. Esta janela será fechada automaticamente.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error exchanging code:', error);
    res.status(500).json({ error: 'Authentication failed', details: error instanceof Error ? error.message : String(error) });
  }
});

// 3. Check Auth Status
app.get('/api/auth/status', async (req, res) => {
  const tokensStr = req.cookies.google_tokens;
  if (!tokensStr) {
    return res.json({ authenticated: false });
  }

  try {
    const tokens = JSON.parse(tokensStr);
    const oauth2Client = getOAuth2Client(req);
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
    res.json({ authenticated: false, error: error instanceof Error ? error.message : String(error) });
  }
});

// 4. Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('google_tokens', {
    secure: true,
    sameSite: 'none',
    httpOnly: true,
  });
  res.json({ success: true });
});

// 5. Sync Data (Upload/Download)
const SYNC_FILE_NAME = 'nox_note_sync.json';

app.post('/api/drive/sync', async (req, res) => {
  const tokensStr = req.cookies.google_tokens;
  if (!tokensStr) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const tokens = JSON.parse(tokensStr);
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);

    // If access token is expired, it will automatically refresh if refresh_token is present
    // But we should update the cookie if it refreshes
    oauth2Client.on('tokens', (newTokens) => {
      const updatedTokens = { ...tokens, ...newTokens };
      res.cookie('google_tokens', JSON.stringify(updatedTokens), {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const { data } = req.body; // The JSON data to sync

    // Check if file exists
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
      // Update existing
      const fileId = files[0].id!;
      await drive.files.update({
        fileId,
        media,
      });
      res.json({ success: true, message: 'Data synced successfully' });
    } else {
      // Create new
      await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id',
      });
      res.json({ success: true, message: 'Data synced successfully' });
    }
  } catch (error) {
    console.error('Error syncing data:', error);
    res.status(500).json({ error: 'Failed to sync data' });
  }
});

app.get('/api/drive/sync', async (req, res) => {
  const tokensStr = req.cookies.google_tokens;
  if (!tokensStr) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const tokens = JSON.parse(tokensStr);
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);

    oauth2Client.on('tokens', (newTokens) => {
      const updatedTokens = { ...tokens, ...newTokens };
      res.cookie('google_tokens', JSON.stringify(updatedTokens), {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Find file
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
  } catch (error) {
    console.error('Error downloading data:', error);
    res.status(500).json({ error: 'Failed to download data' });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Ocorreu um erro inesperado no servidor.',
    path: req.path
  });
});

export default app;
