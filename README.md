# team8-backend

Team8 Backend API service.

## Prerequisites

- Node.js (LTS recommended)
- npm
- PostgreSQL database
- Docker

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in this folder:

```env
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"
```

## Start PostgreSQL With Docker

1. Start the database container:

```bash
docker run --name KNS-JOBS-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=KNS_JOBS -p 5432:5432 -d postgres
```

2. Verify the container is running:

```bash
docker ps
```

3. If you stop your machine or container, start it again with:

```bash
docker start KNS-JOBS-db
```

## Run The API

- Development (watch mode):

```bash
npm run dev
```

- Production build:

```bash
npm run build
```

- Run built app:

```bash
npm start
```

## Test The API

- Run tests once:

```bash
npm test
```

- Run tests with coverage:

```bash
npm run test:coverage
```

## BDD Tests

Gherkin scenarios live in `tests/bdd/features` and run through playwright-bdd against two harnesses:

- `api-mocked` uses in-memory DAOs and needs no database.
- `api-integration` uses the real Prisma DAOs against a throwaway Postgres container on port 5433.

```bash
npm run test:bdd              # both projects
npm run test:bdd:mocked       # no Docker required
npm run test:bdd:integration  # real Postgres
```

The integration project starts the container, applies migrations, and removes the container when the run finishes.

Environment flags:

- `BDD_KEEP_DB=1` keeps the test container running after the run, for faster reruns or inspecting data. Also available as `npm run test:bdd:keep-db`. Tear it down later with `npm run db:test:down`.
- `BDD_EXTERNAL_DB=1` skips container management entirely, for CI where the database is provided as a service.
- `TEST_DATABASE_URL` overrides the test connection string.

## Lint The API

- Lint:

```bash
npm run lint
```

- Lint and auto-fix:

```bash
npm run lint:fix
```

## Migrate The Database

- Create/apply a development migration:

```bash
npx prisma migrate dev --name <migration_name>
```

- Check migration status:

```bash
npx prisma migrate status
```

- Apply existing migrations in deployment environments:

```bash
npx prisma migrate deploy
```

- Open Prisma Studio as visual editor for your database

```bash
npx prisma studio
```

## Logger Usage

This API uses a centralized Winston logger and HTTP request logging via Morgan.

- Logger file: `src/lib/logger.ts`
- Request logging middleware: `src/config/morganMiddleware.ts`

### How Logging Works

- Console logs are always enabled.
- File logs are written to `logs/error.log` (errors) and `logs/all.log` (all levels) when the filesystem is writable.
- Log level is based on `NODE_ENV`:
	- `development` -> `debug`
	- all other values -> `warn`

### Use Logger In Code

Import and use the shared logger instead of `console.log`:

```ts
import Logger from "./lib/logger";

Logger.info("Application started");
Logger.warn("Potential issue detected");
Logger.error("Unexpected error occurred");
Logger.debug("Debug payload");
```

### Inspect Logs

```bash
tail -f logs/all.log
```

```bash
tail -f logs/error.log
```
