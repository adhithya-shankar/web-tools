# WebTools

A modern, production-ready React application with a Backend for Frontend (BFF) architecture using Express, TypeScript, and Vite.

## Architecture

```
┌─────────────┐     ┌─────────────────────────────────────────┐     ┌──────────────┐
│   Browser   │────▶│           BFF Server (Express)          │────▶│  Backend APIs │
│             │◀────│  • Serves React UI                      │◀────│  (External)   │
└─────────────┘     │  • API routes (/api/*)                  │     └──────────────┘
                    │  • Auth/session management              │
                    └─────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type safety
- **Vite** - Fast dev server & bundler
- **Tailwind CSS** - Utility-first styling

### Backend (BFF)
- **Express 5** - Web framework
- **Helmet** - Security headers
- **Compression** - Response compression
- **CORS** - Cross-origin configuration

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **tsx** - TypeScript execution

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

This starts both:
- **Vite dev server** at `http://localhost:5173` (hot reload)
- **Express API server** at `http://localhost:3000`

API requests from the frontend are automatically proxied to the Express server.

### Build for Production

```bash
pnpm build
```

This builds:
- React app → `dist/`
- Express server → `dist-server/`

### Run Production Server

```bash
pnpm start
```

The Express server serves both the API and the React app at `http://localhost:3000`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start both dev servers concurrently |
| `pnpm dev:client` | Start Vite dev server only |
| `pnpm dev:server` | Start Express server only (with hot reload) |
| `pnpm build` | Build frontend and server for production |
| `pnpm start` | Run production server |
| `pnpm preview` | Build and run production server |
| `pnpm lint` | Check for linting issues |
| `pnpm test` | Run tests in watch mode |
| `pnpm typecheck` | Type check frontend and server |

## Project Structure

```
webtools/
├── src/                    # React frontend
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server/                 # BFF server
│   ├── index.ts           # Express entry point
│   ├── routes/
│   │   └── api.ts         # API route handlers
│   └── middleware/
│       └── auth.ts        # Auth middleware
├── dist/                   # Built frontend
├── dist-server/            # Built server
├── vite.config.ts
├── tsconfig.json          # Frontend TS config
├── tsconfig.server.json   # Server TS config
├── Dockerfile
└── docker-compose.yml
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/info` | App information |
| POST | `/api/echo` | Echo request body |
| GET | `/api/data` | Sample data endpoint |

## Deployment

### Docker

Build and run with Docker:

```bash
# Build image
pnpm docker:build
# or
docker build -t webtools .

# Run container
pnpm docker:run
# or
docker run -p 3000:3000 webtools
```

### Docker Compose

```bash
docker-compose up -d
```

### Cloud Platforms

The Docker image works with:
- **Google Cloud Run**
- **AWS ECS / Fargate**
- **Azure Container Apps**
- **DigitalOcean App Platform**
- **Railway / Render / Heroku**

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |

## Adding API Routes

Add new routes in `server/routes/api.ts`:

```typescript
router.get('/users', async (req, res) => {
  // Fetch from external service or database
  const users = await userService.getAll();
  res.json(users);
});
```

## License

MIT
