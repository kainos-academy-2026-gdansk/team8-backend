import { defineConfig } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import { TEST_DATABASE_URL } from "./tests/integrations/bdd/support/testDatabase";

const JWT_SECRET = "bdd-test-secret";
const mockedPort = Number(process.env.BDD_MOCKED_PORT ?? 4010);
const integrationPort = Number(process.env.BDD_INTEGRATION_PORT ?? 4011);
const mockedURL = `http://127.0.0.1:${mockedPort}`;
const integrationURL = `http://127.0.0.1:${integrationPort}`;

process.env.DATABASE_URL ??= TEST_DATABASE_URL;

const features = "tests/integrations/bdd/features/**/*.feature";
const steps = [
	"tests/integrations/bdd/steps/**/*.ts",
	"tests/integrations/bdd/fixtures.ts",
];

const mockedTestDir = defineBddConfig({
	features,
	steps,
	outputDir: "tests/integrations/bdd/.features-gen/mocked",
});

const integrationTestDir = defineBddConfig({
	features,
	steps,
	// Fault-injection scenarios cannot be reproduced against a real database.
	tags: "not @mocked-only",
	outputDir: "tests/integrations/bdd/.features-gen/integration",
});

export default defineConfig({
	reporter: [["list"]],
	workers: 1,
	globalTeardown: "./tests/integrations/bdd/support/globalTeardown.ts",
	projects: [
		{
			name: "api-mocked",
			testDir: mockedTestDir,
			use: { baseURL: mockedURL },
		},
		{
			name: "api-integration",
			testDir: integrationTestDir,
			// Scenarios truncate and reseed a shared database, so they must not overlap.
			workers: 1,
			use: { baseURL: integrationURL },
		},
		{
			name: "registration",
			testDir: "./tests/integrations",
			testMatch: "register.spec.ts",
			workers: 1,
		},
	],
	webServer: [
		{
			command: "tsx tests/integrations/bdd/support/testServer.ts",
			url: `${mockedURL}/health`,
			reuseExistingServer: !process.env.CI,
			env: { BDD_PORT: String(mockedPort), JWT_SECRET },
		},
		{
			command:
				"npm run db:test:prepare && tsx tests/integrations/bdd/support/integrationServer.ts",
			url: `${integrationURL}/health`,
			// Never reuse: a stale harness would skip provisioning and point at a removed container.
			reuseExistingServer: false,
			timeout: 180_000,
			env: {
				BDD_PORT: String(integrationPort),
				JWT_SECRET,
				DATABASE_URL: TEST_DATABASE_URL,
			},
		},
	],
});
