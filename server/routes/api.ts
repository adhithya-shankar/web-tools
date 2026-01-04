import { Router, type Request, type Response } from 'express';
import express from 'express';
import type { Server } from 'http';
import cors from 'cors';

const router = Router();

// ============================================
// Mock Server State & Endpoints
// ============================================
interface MockEndpoint {
  id: string;
  method: string;
  path: string;
  response: string;
  status: number;
  delay: number;
}

let mockServerState = {
  isRunning: false,
  port: 3001,
  endpoints: [] as MockEndpoint[],
};

let mockHttpServer: Server | null = null;

// Create and start the actual mock HTTP server
function createMockServer(port: number, endpoints: MockEndpoint[]): Promise<Server> {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Handle all requests - use middleware instead of route pattern
    app.use(async (req, res) => {
      const requestPath = req.path;
      const method = req.method;

      // Find matching endpoint
      const endpoint = endpoints.find(
        (e) => e.path === requestPath && e.method === method
      );

      if (!endpoint) {
        res.status(404).json({
          error: 'Endpoint not found',
          path: requestPath,
          method,
          availableEndpoints: endpoints.map((e) => `${e.method} ${e.path}`),
        });
        return;
      }

      // Simulate delay if configured
      if (endpoint.delay > 0) {
        await new Promise((r) => setTimeout(r, endpoint.delay));
      }

      // Send mock response
      try {
        const responseBody = JSON.parse(endpoint.response);
        res.status(endpoint.status).json(responseBody);
      } catch {
        res.status(endpoint.status).send(endpoint.response);
      }
    });

    const server = app.listen(port, () => {
      console.log(`🎭 Mock server running on http://localhost:${port}`);
      resolve(server);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} is already in use`));
      } else {
        reject(err);
      }
    });
  });
}

// Start mock server
router.post('/mock-server/start', async (req: Request, res: Response) => {
  const { port = 3001, endpoints = [] } = req.body;

  // Stop existing server if running
  if (mockHttpServer) {
    mockHttpServer.close();
    mockHttpServer = null;
  }

  try {
    mockHttpServer = await createMockServer(port, endpoints);
    mockServerState = {
      isRunning: true,
      port,
      endpoints,
    };
    res.json({ success: true, port, message: `Mock server started on port ${port}` });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to start mock server',
    });
  }
});

// Stop mock server
router.post('/mock-server/stop', (_req: Request, res: Response) => {
  if (mockHttpServer) {
    mockHttpServer.close(() => {
      console.log('🎭 Mock server stopped');
    });
    mockHttpServer = null;
  }
  mockServerState.isRunning = false;
  res.json({ success: true, message: 'Mock server stopped' });
});

// Get mock server status
router.get('/mock-server/status', (_req: Request, res: Response) => {
  res.json({
    isRunning: mockServerState.isRunning,
    port: mockServerState.port,
    endpointCount: mockServerState.endpoints.length,
  });
});

// Update mock endpoints (requires restart to take effect)
router.post('/mock-server/endpoints', async (req: Request, res: Response) => {
  const { endpoints } = req.body;
  mockServerState.endpoints = endpoints || [];

  // If server is running, restart it with new endpoints
  if (mockServerState.isRunning && mockHttpServer) {
    const port = mockServerState.port;
    mockHttpServer.close();
    try {
      mockHttpServer = await createMockServer(port, mockServerState.endpoints);
      res.json({ success: true, count: mockServerState.endpoints.length, restarted: true });
    } catch (err) {
      mockServerState.isRunning = false;
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to restart mock server',
      });
    }
  } else {
    res.json({ success: true, count: mockServerState.endpoints.length });
  }
});

// ============================================
// Original API Endpoints
// ============================================

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

