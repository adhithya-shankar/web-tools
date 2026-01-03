import { Router, type Request, type Response } from 'express';

const router = Router();

// Example: Get app info
router.get('/info', (_req: Request, res: Response) => {
  res.json({
    name: 'WebTools',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Example: Echo endpoint for testing
router.post('/echo', (req: Request, res: Response) => {
  res.json({
    message: 'Echo response',
    received: req.body,
    timestamp: new Date().toISOString(),
  });
});

// Example: Simulated data endpoint
// In a real app, this would fetch from a database or external API
router.get('/data', async (_req: Request, res: Response) => {
  // Simulate async operation (e.g., database query, external API call)
  const data = {
    items: [
      { id: 1, name: 'Item One', status: 'active' },
      { id: 2, name: 'Item Two', status: 'pending' },
      { id: 3, name: 'Item Three', status: 'completed' },
    ],
    total: 3,
    page: 1,
    perPage: 10,
  };

  res.json(data);
});

// 404 handler for unknown API routes
router.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'API endpoint not found',
  });
});

export default router;

