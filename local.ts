import 'dotenv/config';
import express from 'express';
import { appInstance as app } from './api/index';
import path from 'path';

const PORT = 3000;

async function startLocalServer() {
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
