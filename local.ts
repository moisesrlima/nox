import dotenv from 'dotenv';
import express from 'express';
import path from 'path';

// IMPORTANT: dotenv must run BEFORE importing api/index, because that module
// reads process.env at top-level (Env Status, googleConfig, envGuard, etc.).
// ESM hoists static imports, so we use a dynamic import() for api/index inside
// startLocalServer() to guarantee env vars are seeded first.
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const PORT = 3000;

async function startLocalServer() {
  const { appInstance: app } = await import('./api/index');

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

  // Handle /api prefix for local dev to match Vercel rewrites
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      req.url = req.url.replace('/api', '');
    }
    next();
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Local server running on http://localhost:${PORT}`);
  });
}

startLocalServer();
