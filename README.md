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

### Unit & Service Tests (Vitest)

Unit tests for controllers, services, DAOs, and utilities using Vitest. These are fast and don't require a database.

```bash
npm test                    # Run all unit tests once
npm run test:coverage       # Run unit tests with coverage report
```

### BDD Integration Tests (Playwright)

Behavior-driven tests for applying to job roles and user registration using Playwright and Gherkin feature files.

**Two test harnesses available:**

- **`api-mocked`** — Uses in-memory DAOs; fast, no database required
- **`api-integration`** — Uses real Prisma DAOs against ephemeral PostgreSQL on port 5433; verifies real database behavior

```bash
npm run test:bdd              # Run both mocked and integration BDD tests
npm run test:bdd:mocked       # Mocked harness only (fastest, no Docker)
npm run test:bdd:integration  # Integration harness only (requires Docker)
npm run test:integration      # apply-for-role BDD tests + user registration test
npm run test:bdd:keep-db      # Integration tests with database persisted for debugging
```

**Test files:**

- Feature files: `tests/integrations/bdd/features/*.feature` (Gherkin scenarios)
- Step definitions: `tests/integrations/bdd/steps/*.ts` (test logic)
- Registration test: `tests/integrations/register.spec.ts` (Argon2 password hash verification)

**Environment flags:**

| Flag | Effect | Use case |
|------|--------|----------|
| `BDD_KEEP_DB=1` | Keep test database running after tests | Faster reruns, manual inspection |
| `BDD_EXTERNAL_DB=1` | Skip container management | CI environments with provided services |
| `TEST_DATABASE_URL` | Override test connection string | Custom test database URL (must end with `_test`) |

**Database lifecycle:**

- Integration tests auto-provision a throwaway Postgres container on port 5433
- Database is ephemeral (tmpfs); rebuilt from migrations on every run
- Container is destroyed after tests unless `BDD_KEEP_DB=1` or `BDD_EXTERNAL_DB=1` are set
- Use `npm run db:test:down` to manually clean up kept containers

### Test Database Management

```bash
npm run db:test:up          # Start test database container (port 5433)
npm run db:test:prepare     # Start container and apply migrations
npm run db:test:down        # Stop and remove test database container
```

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
