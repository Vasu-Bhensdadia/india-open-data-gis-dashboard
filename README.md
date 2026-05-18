# India Open Data GIS Dashboard

Professional monorepo scaffold for a full-stack GIS analytics dashboard focused on Indian open data. This repository currently contains only project structure and configuration files; no business logic has been added yet.

## Folder Structure

```text
frontend/              # Isolated Next.js client application workspace for maps, dashboards, and UI assets.
backend/               # Isolated API and service workspace for data access, GIS processing, and server configuration.
datasets/              # Local data staging area. Raw, external, and processed datasets are ignored by default to avoid committing large files.
docs/                  # Project documentation for architecture decisions, API notes, and data-source references.
scripts/               # Automation workspace for development, data preparation, deployment, and maintenance scripts.
```

## Workspace Layout

```text
frontend/
  public/              # Static frontend assets.
  src/
    app/               # Next.js App Router entry points, layouts, and pages.
    components/        # Shared reusable UI components.
    features/          # Feature-oriented frontend modules.
    hooks/             # Shared React hooks.
    lib/               # Frontend utilities, clients, and adapters.
    services/          # Client-side service wrappers and API adapters.
    store/             # Client state management modules.
    styles/            # Global styles and design tokens.
    types/             # Shared frontend TypeScript types.

backend/
  src/
    config/            # Backend configuration loading and validation.
    controllers/       # Request handlers that coordinate API responses.
    middleware/        # Express middleware for errors, request flow, and cross-cutting concerns.
    routes/            # Versioned API route modules.
    services/          # Service-layer modules for backend capabilities.
    types/             # Backend TypeScript contracts and shared types.
    utils/             # Backend utility helpers.
  tests/               # Backend tests and fixtures.

datasets/
  raw/                 # Original downloaded or manually sourced data files.
  processed/           # Cleaned and transformed data outputs.
  external/            # Third-party reference datasets.
  metadata/            # Dataset catalogs, schemas, licenses, and provenance notes.

docs/
  architecture/        # System design notes and architecture decisions.
  api/                 # API contracts and endpoint documentation.
  data/                # Data-source research, quality notes, and lineage documentation.

scripts/
  dev/                 # Local development helper scripts.
  data/                # Dataset acquisition and preparation scripts.
  deploy/              # Deployment and operations scripts.
```

## Environment Files

Environment templates are provided at:

- `.env.example` for shared root settings.
- `frontend/.env.example` for validated client-facing configuration.
- `backend/.env.example` for validated server-side configuration.

Create local `.env` files from these examples when development begins. Real secrets and local dataset files should not be committed.

Validated environment variables:

- Frontend: `NEXT_PUBLIC_API_URL`. Because it uses the `NEXT_PUBLIC_` prefix, this value is safe to expose to the browser. It defaults to the local backend API URL during non-production development and is required in production.
- Backend: `PORT` and `NODE_ENV`, plus existing non-secret service defaults such as `HOST`, `LOG_LEVEL`, `API_PREFIX`, `API_VERSION`, `CORS_ORIGIN`, and `DATASETS_DIR`.

Environment validation is schema-based with Zod and runs during application startup. Access environment values through the workspace-local config modules instead of reading `process.env` directly:

- Frontend: `frontend/src/config/env.ts`
- Backend: `backend/src/config/env.ts`

## Development Workflow

This monorepo uses npm workspaces to keep the frontend and backend isolated while allowing root-level orchestration. Install dependencies from the repository root:

```bash
npm install
```

Start the full stack development environment with one root command:

```bash
npm run dev
```

The root development command runs the isolated workspace dev scripts concurrently:

- `frontend`: Next.js development server.
- `backend`: Express API development server.

Use workspace-specific commands when you only need one side of the stack:

```bash
npm run dev:frontend
npm run dev:backend
```

Common root commands:

```bash
npm run build
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run test
npm run typecheck
```

Workspace-specific quality commands are also available:

```bash
npm run lint:frontend
npm run lint:backend
npm run format:frontend
npm run format:backend
npm run typecheck:frontend
npm run typecheck:backend
```

Formatting is configured once at the repository root in `.prettierrc.json`. ESLint remains workspace-specific so the frontend can use Next.js rules and the backend can use Node.js rules, with shared TypeScript rule choices imported from `eslint.shared.mjs`.

The frontend workspace is initialized as a Next.js App Router application. The backend workspace is initialized as an Express.js API service with TypeScript.

Production-style starts remain isolated:

```bash
npm run start:frontend
npm run start:backend
```
