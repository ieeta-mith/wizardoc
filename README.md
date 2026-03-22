# WizarDoc

WizarDoc is a document-generation workflow for study teams. It lets users create projects, attach question pools/templates, answer wizard-style questionnaires, and generate output documents from completed assessments.

This directory contains the full WizarDoc stack:
- `api/`: FastAPI backend
- `web/`: Next.js frontend
- `deployment/`: Docker Compose and Nginx configuration

## Repository Layout

```text
wizardoc/
├── api/          FastAPI service, MongoDB access, DOCX generation
├── web/          Next.js 16 app served under /wizardoc
├── deployment/   Docker Compose, Nginx proxy, environment config
└── README.md     This file
```

## Stack

### Backend
- FastAPI
- MongoDB via Motor
- `docxtpl` for DOCX population
- Python 3.12+

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI primitives

### Deployment
- Docker Compose
- Nginx reverse proxy
- MongoDB 7

## How It Works

At a high level, the product flow is:
1. Create or open a project.
2. Associate it with a question pool/template.
3. Create documents for that project.
4. Fill in answers in the wizard.
5. Save as draft or complete the document.
6. Generate a DOCX file from completed answers.

## Local Development

### Prerequisites

- Python `3.12+`
- `uv`
- Node.js `18+`
- npm
- MongoDB, unless you run it through Docker

### 1. Start the API

```bash
cd wizardoc/api
uv sync
uv run fastapi dev src/main.py
```

The API runs on `http://localhost:8000`.

Useful endpoints:
- API docs: `http://localhost:8000/api/docs`
- OpenAPI schema: `http://localhost:8000/api/openapi.json`
- Health check: `http://localhost:8000/health`

### 2. Start the frontend

```bash
cd wizardoc/web
npm install
npm run dev
```

The Next.js app runs on `http://localhost:3000/wizardoc`.

In development, the frontend defaults to `http://localhost:8000/api` for backend requests, so no extra API URL setup is required for the normal local flow.

### 3. Local environment notes

Frontend local env lives in [`web/.env.local`](./web/.env.local). Current values enable standalone/sidebar dev mode and include Keycloak-related settings.

The frontend is configured with a base path:
- App base path: `/wizardoc`

That means local routes should be opened under `/wizardoc`, not `/`.

## Docker / Full Stack Run

To run the full stack with MongoDB, API, web, and reverse proxy:

```bash
cd wizardoc/deployment
docker compose up --build
```

Default access points:
- App: `http://localhost/wizardoc`
- API docs: `http://localhost/api/docs`
- Health check: `http://localhost/health`

Compose configuration is defined in [`deployment/docker-compose.yml`](./deployment/docker-compose.yml).

Environment overrides for Docker live in [`deployment/.env`](./deployment/.env).

## Key Directories

### `api/`

The backend exposes the REST endpoints used by the frontend, including:
- `/api/studies`
- `/api/question-pools`
- `/api/assessments`
- `/api/auth`

The FastAPI app also exposes:
- `/health`
- `/api/docs`

See [`api/README.md`](./api/README.md) for backend-specific details.

### `web/`

The frontend is a Next.js App Router application. Notable behavior:
- served under `/wizardoc`
- uses `output: "standalone"` for container builds
- talks to the backend through `/api` in production/proxied environments

See [`web/README.md`](./web/README.md) for frontend-specific details.

### `deployment/`

The deployment directory contains the Docker and reverse-proxy setup used to run the application as a single stack.

See [`deployment/README.md`](./deployment/README.md) for deployment-specific details.

## Common Commands

```bash
# API dev server
cd wizardoc/api
uv run fastapi dev src/main.py

# Frontend dev server
cd wizardoc/web
npm run dev

# Full stack via Docker
cd wizardoc/deployment
docker compose up --build
```