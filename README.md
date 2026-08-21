# Creator-Business Collaboration Platform

A comprehensive platform connecting content creators with businesses for sponsored content, campaigns, and seamless collaboration management.

## Architecture

This is a **monorepo** using npm workspaces, containing:

| App | Technology | Port | Purpose |
|-----|-----------|------|---------|
| `apps/backend` | NestJS | 3000 | REST API + WebSocket server |
| `apps/admin` | Next.js 14 | 3001 | Admin management portal |
| `apps/creator-app` | Flutter | — | Mobile app for creators |
| `apps/business-app` | Flutter | — | Mobile app for businesses |
| `packages/shared` | TypeScript | — | Shared types, utilities, constants |
| `packages/prisma` | Prisma ORM | — | Database schema and client |

## Tech Stack

- **Backend**: NestJS, TypeORM/Prisma, Passport/JWT, Socket.io, BullMQ, Winston
- **Admin Portal**: Next.js 14, Tailwind CSS, Radix UI, React Query, Recharts
- **Mobile**: Flutter
- **Database**: PostgreSQL 16
- **Cache/Queue**: Redis 7
- **Payments**: Razorpay (Indian market focus)
- **Infrastructure**: Docker, Docker Compose

## Prerequisites

- Node.js >= 20.0.0
- npm >= 9.0.0
- PostgreSQL >= 16
- Redis >= 7
- (Optional) Docker & Docker Compose

## Local Setup

### Option A: Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd creator-biz-platform

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### Option B: Manual Setup

```bash
# Install dependencies
npm install

# Start PostgreSQL and Redis
# macOS with Homebrew:
brew services start postgresql@16 redis

# Set up database
npm run db:generate
npm run db:migrate

# Start all apps in development
npm run dev
```

This starts:
- Backend API at http://localhost:3000
- Admin Portal at http://localhost:3001

## Project Structure

```
creator-biz-platform/
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── src/
│   │   │   ├── modules/  # Feature modules
│   │   │   ├── middleware/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── main.ts
│   │   └── ...
│   ├── admin/            # Next.js admin panel
│   ├── creator-app/      # Flutter creator app
│   └── business-app/     # Flutter business app
├── packages/
│   ├── shared/           # Shared TypeScript types
│   └── prisma/           # Database schema
├── docker/               # Docker configuration
└── docs/                 # Documentation
```

## Environment Variables

See `.env.example` for all required variables. Key ones:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` - Redis connection
- `JWT_SECRET` - JWT signing secret
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` - Razorpay credentials
- `SENDGRID_API_KEY` - Email service

## Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

## Scripts

```bash
npm run dev              # Start all apps
npm run dev:backend      # Start backend only
npm run dev:admin        # Start admin only
npm run build            # Build all workspaces
npm run lint             # Lint all workspaces
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking
```

## User Roles

- **Admin** - Platform administrators
- **Creator** - Content creators / influencers
- **Business** - Brand representatives / business users

## Contributing

See `CONTRIBUTING.md` for guidelines.
