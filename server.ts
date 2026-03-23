import 'dotenv/config';
import express from 'express';
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';
import path from 'path';
import serverless from 'serverless-http';

console.log('Server starting... Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  hasClientId: !!(process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID),
  hasRedirectUri: !!process.env.GOOGLE_REDIRECT_URI
});

console.log("ENV CHECK:", {
  clientId: !!process.env.GOOGLE_CLIENT_ID,
  secret: !!process.env.GOOGLE_CLIENT_SECRET,
  redirect: !!process.env.GOOGLE_REDIRECT_URI
});

// Centralized Config
const googleConfig = {
  get clientId() { return process.env.GOOGLE_CLIENT_ID; },
  get clientSecret() { return process.env.GOOGLE_CLIENT_SECRET; },
  get redirectUri() { return process.env.GOOGLE_REDIRECT_URI; }
};

// Safe Handler Wrapper
const safeHandler = (handler: (req: express.Request, res: express.Response) => Promise<any>) => {
  return async (req: express.Request, res: express.Response) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(`Error in ${req.path}:`, error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : String(error),
          path: req.path,
          version: '1.0.8'
        });
      }
    }
  };
};

// Validation function
function validateEnv() {
  const { clientId, clientSecret, redirectUri } = googleConfig;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID não definido no ambiente.");
  if (!clientSecret) throw new Error("GOOGLE_CLIENT_SECRET não definido no ambiente.");
  if (!redirectUri) throw new Error("GOOGLE_REDIRECT_URI não definido no ambiente.");
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Diagnostic route
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '1.0.8',
    timestamp: new Date().toISOString(),
    env: { 
      hasClientId: !!googleConfig.clientId, 
      hasClientSecret: !!googleConfig.clientSecret,
      hasRedirectUri: !!googleConfig.redirectUri,
      clientIdValue: googleConfig.clientId ? `${googleConfig.clientId.substring(0, 10)}...` : 'MISSING',
      redirectUriValue: googleConfig.redirectUri || 'MISSING',
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV
    }
  });
});

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', time: new Date().toISOString(), version: '1.0.8' });
});

// OAuth2 Client setup
const getOAuth2Client = () => {
  validateEnv();

  const { clientId, clientSecret, redirectUri } = googleConfig;

  console.log('Creating OAuth2 client with config:', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    redirectUri
  });

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
};

// 1. Get Auth URL
app.get('/api/auth/url', safeHandler(async (req, res) => {
  const oauth2Client = getOAuth2Client();
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
}));

// 2. Auth Callback
app.get(['/auth/callback', '/api/auth/callback'], safeHandler(async (req, res) => {
  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    return res.status(400).send('Missing code');
  }

  const oauth2Client = getOAuth2Client();
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
}));

// 3. Check Auth Status
app.get('/api/auth/status', safeHandler(async (req, res) => {
  const tokensStr = req.cookies?.google_tokens;
  if (!tokensStr) {
    return res.json({ authenticated: false });
  }

  const tokens = JSON.parse(tokensStr);
  
  // Use fetch for user info to be lighter and more robust
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`
    }
  });

  if (!response.ok) {
    // If token is expired, we might need to refresh it, but for status check we just return false
    return res.json({ authenticated: false, error: 'Token expired or invalid' });
  }

  const userInfo = await response.json();

  res.json({
    authenticated: true,
    user: {
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture
    }
  });
}));

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

app.post('/api/drive/sync', safeHandler(async (req, res) => {
  const tokensStr = req.cookies?.google_tokens;
  if (!tokensStr) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const tokens = JSON.parse(tokensStr);
  const oauth2Client = getOAuth2Client();
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
}));

app.get('/api/drive/sync', safeHandler(async (req, res) => {
  const tokensStr = req.cookies?.google_tokens;
  if (!tokensStr) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const tokens = JSON.parse(tokensStr);
  const oauth2Client = getOAuth2Client();
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
}));

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Error:', err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: err.message || 'Ocorreu um erro inesperado no servidor.',
      path: req.path,
      version: '1.0.8'
    });
  }
});

export const handler = serverless(app);
export default app;
