import express from 'express';
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';
import serverless from 'serverless-http';

const VERSION = '1.1.7';
const isVercel = !!process.env.VERCEL;

console.log('--- API BOOTSTRAP ---');
console.log('Version:', VERSION);
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
});

const REQUIRED_ENVS = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI'
];

const checkEnvs = () => {
  const missing = REQUIRED_ENVS.filter(env => !process.env[env]);
  return {
    isValid: missing.length === 0,
    missing
  };
};

console.log('Env Status:', checkEnvs());

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
      console.error(`[API ERROR] Error in ${req.path}:`, error);
      if (error instanceof Error) {
        console.error('Stack:', error.stack);
      }
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : String(error),
          stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
          path: req.path,
          version: VERSION
        });
      }
    }
  };
};

// Middleware to check ENVs
const envGuard = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = checkEnvs();
  if (!status.isValid) {
    console.error('Access denied: Missing ENVs', status.missing);
    return res.status(500).json({
      error: 'ENV_MISSING',
      missing: status.missing,
      message: 'Configuração do servidor incompleta: Variáveis de ambiente faltando.',
      version: VERSION
    });
  }
  next();
};

const app = express();
const router = express.Router();

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Helper for cookies
const cookieOptions = {
  secure: isVercel, // Only secure on Vercel (HTTPS)
  sameSite: isVercel ? 'none' as const : 'lax' as const,
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

// Diagnostic route
router.get('/test', (req, res) => {
  const envStatus = checkEnvs();
  res.json({ 
    status: 'ok', 
    version: VERSION,
    timestamp: new Date().toISOString(),
    env: { 
      isValid: envStatus.isValid,
      missing: envStatus.missing,
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

// Debug ENV route
router.get('/debug/env', (req, res) => {
  const envStatus = checkEnvs();
  res.json({
    version: VERSION,
    isVercel,
    vercelEnv: process.env.VERCEL_ENV,
    requiredEnvs: REQUIRED_ENVS.map(name => ({
      name,
      defined: !!process.env[name],
      value: process.env[name] ? (name.includes('SECRET') ? '********' : process.env[name]) : null
    })),
    status: envStatus
  });
});

router.get('/ping', (req, res) => {
  res.json({ message: 'pong', time: new Date().toISOString(), version: VERSION });
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: VERSION });
});

// OAuth2 Client setup
const getOAuth2Client = () => {
  const { clientId, clientSecret, redirectUri } = googleConfig;
  // We don't throw here anymore, we rely on envGuard middleware for routes
  // But if called directly, we return a client that might fail later if ENVs are null
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

// 1. Get Auth URL
router.get(['/auth/url', '/gdrive/auth-url'], envGuard, safeHandler(async (req, res) => {
  console.log('--- REQUEST: /auth/url ---');
  console.log('Headers:', req.headers);
  console.log('Generating auth URL...');
  const oauth2Client = getOAuth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
  });
  console.log('Auth URL generated successfully:', url);
  res.json({ url });
}));

// 2. Auth Callback
router.get(['/auth/callback', '/gdrive/callback'], envGuard, safeHandler(async (req, res) => {
  const { code } = req.query;
  console.log('Auth callback received. Code present:', !!code);
  
  if (!code || typeof code !== 'string') {
    console.error('Missing or invalid code in callback');
    return res.status(400).send('Missing code');
  }

  const oauth2Client = getOAuth2Client();
  console.log('Exchanging code for tokens with redirectUri:', googleConfig.redirectUri);
  try {
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: googleConfig.redirectUri
    });
    console.log('Tokens received successfully');
    
    res.cookie('google_tokens', JSON.stringify(tokens), cookieOptions);

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
    console.error('Error exchanging code for tokens:', error);
    throw error; // Let safeHandler catch it
  }
}));

// 3. Check Auth Status
router.get(['/auth/status', '/gdrive/auth-status'], safeHandler(async (req, res) => {
  const tokensStr = req.cookies?.google_tokens;
  if (!tokensStr) {
    return res.json({ authenticated: false });
  }

  let tokens;
  try {
    tokens = JSON.parse(tokensStr);
  } catch (e) {
    return res.json({ authenticated: false, error: 'Invalid token format' });
  }
  
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`
    }
  });

  if (!response.ok) {
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
router.post(['/auth/logout', '/gdrive/logout'], (req, res) => {
  res.clearCookie('google_tokens', {
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    httpOnly: cookieOptions.httpOnly,
  });
  res.json({ success: true });
});

// 5. Sync Data (Upload/Download)
const SYNC_FOLDER_NAME = 'NoxNote_Sync';
const SYNC_FILE_NAME = 'notes_backup.json';

async function getOrCreateFolder(drive: any) {
  console.log('[DRIVE] Searching for folder:', SYNC_FOLDER_NAME);
  try {
    const searchRes = await drive.files.list({
      q: `name='${SYNC_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id)',
    });

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      console.log('[DRIVE] Folder found:', searchRes.data.files[0].id);
      return searchRes.data.files[0].id;
    }

    console.log('[DRIVE] Folder not found, creating...');
    const folderMetadata = {
      name: SYNC_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    console.log('[DRIVE] Folder created:', folder.data.id);
    return folder.data.id;
  } catch (error: any) {
    console.error('[DRIVE] Error in getOrCreateFolder:', error);
    if (error.response) {
      console.error('[DRIVE] Error response data:', error.response.data);
    }
    throw error;
  }
}

router.post(['/drive/sync', '/gdrive/sync'], envGuard, safeHandler(async (req, res) => {
  console.log('[SYNC] POST request received');
  const tokensStr = req.cookies?.google_tokens;
  if (!tokensStr) {
    console.warn('[SYNC] No tokens found in cookies');
    return res.status(401).json({ error: 'Not authenticated' });
  }

  let tokens;
  try {
    tokens = JSON.parse(tokensStr);
  } catch (e) {
    console.error('[SYNC] Failed to parse tokens:', e);
    return res.status(401).json({ error: 'Invalid authentication tokens' });
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  console.log('[SYNC] Initializing Drive API...');
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const { data } = req.body;

  if (!data) {
    console.warn('[SYNC] No data in request body');
    return res.status(400).json({ error: 'No data provided' });
  }

  try {
    // 1. Get or create the specific folder
    console.log('[SYNC] Getting or creating folder:', SYNC_FOLDER_NAME);
    const folderId = await getOrCreateFolder(drive);
    console.log('[SYNC] Folder ID:', folderId);

    // 2. Search for the file inside that folder
    console.log('[SYNC] Searching for file:', SYNC_FILE_NAME);
    const searchRes = await drive.files.list({
      q: `name='${SYNC_FILE_NAME}' and '${folderId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id)',
    });

    const files = searchRes.data.files;
    console.log('[SYNC] Files found:', files?.length || 0);
    
    const media = {
      mimeType: 'application/json',
      body: JSON.stringify(data),
    };

    if (files && files.length > 0) {
      console.log('[SYNC] Updating existing file:', files[0].id);
      await drive.files.update({
        fileId: files[0].id!,
        media,
      });
    } else {
      console.log('[SYNC] Creating new file in folder:', folderId);
      await drive.files.create({
        requestBody: {
          name: SYNC_FILE_NAME,
          parents: [folderId],
          mimeType: 'application/json',
        },
        media,
        fields: 'id',
      });
    }
    console.log('[SYNC] Sync successful');
    res.json({ success: true, message: `Sincronizado na pasta ${SYNC_FOLDER_NAME}` });
  } catch (driveError: any) {
    console.error('[SYNC] Google Drive API Error:', driveError);
    if (driveError.response) {
      console.error('[SYNC] Drive API Response Data:', driveError.response.data);
      console.error('[SYNC] Drive API Response Status:', driveError.response.status);
    }
    throw driveError; // Rethrow to be caught by safeHandler
  }
}));

router.get(['/drive/sync', '/gdrive/sync'], envGuard, safeHandler(async (req, res) => {
  const tokensStr = req.cookies?.google_tokens;
  if (!tokensStr) return res.status(401).json({ error: 'Not authenticated' });

  const tokens = JSON.parse(tokensStr);
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // 1. Find the folder
  const folderRes = await drive.files.list({
    q: `name='${SYNC_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    spaces: 'drive',
    fields: 'files(id)',
  });

  if (!folderRes.data.files || folderRes.data.files.length === 0) {
    return res.json({ data: null, message: 'Pasta de sincronização não encontrada.' });
  }

  const folderId = folderRes.data.files[0].id;

  // 2. Find the file in that folder
  const searchRes = await drive.files.list({
    q: `name='${SYNC_FILE_NAME}' and '${folderId}' in parents and trashed=false`,
    spaces: 'drive',
    fields: 'files(id)',
  });

  const files = searchRes.data.files;
  if (!files || files.length === 0) {
    return res.json({ data: null, message: 'Arquivo de backup não encontrado.' });
  }

  const fileRes = await drive.files.get({
    fileId: files[0].id!,
    alt: 'media',
  }, { responseType: 'json' });

  res.json({ data: fileRes.data });
}));

// Mount router
app.use(['/api', '/'], router);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Error:', err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: err.message || 'Ocorreu um erro inesperado no servidor.',
      path: req.path,
      version: VERSION
    });
  }
});

// Export the app directly for Vercel
export const appInstance = app;
export default app;
