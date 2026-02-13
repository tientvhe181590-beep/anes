# ANES – AI-driven Nutrition & Exercise System

An offline-first Progressive Web App combining personalized fitness routines with AI-powered kitchen inventory analysis.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5, Vite 7, Tailwind CSS 4 |
| Backend | Spring Boot 3, Java 21, Maven |
| Local DB | RxDB (IndexedDB via Dexie) |
| Remote DB | MySQL (prod) / H2 (dev) |
| State | TanStack Query + RxDB observation + Zustand |
| AI | Gemini via Spring Boot proxy (Vercel AI SDK patterns) |
| Auth | JWT + Refresh Tokens |

## Prerequisites

- **Node.js** 20+
- **pnpm** 10+
- **Java** 21 (Temurin recommended)
- **Maven** 3.9+ (wrapper included)
- **MySQL** 8+ (production only; dev uses H2)

## Quick Start

```bash
# Clone
git clone <repo-url> && cd anes

# Frontend
cd client
pnpm install
pnpm run dev          # → http://localhost:5173

# Backend (new terminal)
cd server
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev   # → http://localhost:8080
# Windows: mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

Copy `.env.example` to `.env` and fill in values before running in production.

## Project Structure

```
anes/
├── client/                 # React SPA (PWA)
│   ├── src/
│   │   ├── app/            # Providers, router, RxDB init, Zustand store
│   │   ├── features/       # Feature-sliced modules
│   │   │   ├── auth/
│   │   │   ├── onboarding/
│   │   │   ├── dashboard/
│   │   │   ├── workouts/
│   │   │   ├── nutrition/
│   │   │   └── ai-coach/
│   │   ├── shared/         # Reusable types, hooks, utils, components
│   │   └── sw.ts           # Service worker (Workbox)
│   └── public/             # Static assets, manifest
│
├── server/                 # Spring Boot API
│   ├── src/main/java/com/anes/server/
│   │   ├── auth/           # Authentication controllers
│   │   ├── ai/             # Gemini proxy (BFF)
│   │   ├── sync/           # RxDB replication endpoints
│   │   ├── workout/        # Workout domain
│   │   ├── nutrition/      # Nutrition domain
│   │   ├── user/           # User domain
│   │   └── common/         # Shared DTOs, exceptions, config
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/   # Flyway SQL migrations
│
├── docs/                   # Architecture, SRS, screen specs
├── .github/workflows/      # CI/CD pipelines
└── _bmad*/                 # Agent frameworks
```

## Available Scripts

### Frontend (`client/`)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (port 5173) |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm format:check` | Check formatting |
| `pnpm test` | Run Vitest |
| `pnpm test:watch` | Watch mode |
| `pnpm test:coverage` | Coverage report |
| `pnpm test:e2e` | Playwright E2E tests |

### Backend (`server/`)

| Command | Description |
|---------|-------------|
| `./mvnw spring-boot:run` | Start dev server (port 8080) |
| `./mvnw test` | Run JUnit tests |
| `./mvnw verify` | Full build + tests |
| `./mvnw package -DskipTests` | Build JAR |

## API Overview

```
/api/v1/
├── auth/           # POST register, login, refresh
├── sync/push       # POST – RxDB client → server
├── sync/pull       # GET  – RxDB server → client
├── ai/chat         # POST – Gemini text proxy
├── ai/vision/scan  # POST – Gemini vision proxy
└── actuator/health # GET  – Health check
```

## Architecture

- **Offline-first**: RxDB is the source of truth on the client. Network failures are expected.
- **Sync protocol**: Push/pull replication between RxDB ↔ Spring Boot ↔ MySQL.
- **BFF proxy**: All AI/external API calls go through Spring Boot — API keys never reach the client.
- **Feature-Sliced Design**: Each domain is self-contained with its own components, hooks, API layer, and types.

## Documentation

| Document | Location |
|----------|----------|
| Software Requirements (SRS) | `docs/R3-SRS.md` |
| System Design (SDS) | `docs/R4-SDS.md` |
| Database Schema | `docs/database.sql` |
| Documentation Hub | `docs/index.md` |
| Deployment Runbook | `docs/deployment/runbook.md` |
| Environment Variables | `docs/deployment/environments.md` |
| Security Docs | `docs/security/index.md` |
| Analytics Docs | `docs/analytics/index.md` |
| API Docs | `docs/api/index.md` |

## License

Private — All rights reserved.
