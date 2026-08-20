import { defineConfig } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import { TEST_DATABASE_URL } from "./tests/bdd/support/testDatabase";

const JWT_SECRET = process.env.JWT_SECRET ?? "bdd-test-secret";
const mockedPort = Number(process.env.BDD_MOCKED_PORT ?? 4010);
const integrationPort = Number(process.env.BDD_INTEGRATION_PORT ?? 4011);
const mockedURL = `http://127.0.0.1:${mockedPort}`;
const integrationURL = `http://127.0.0.1:${integrationPort}`;

const features = "tests/bdd/features/**/*.feature";
const steps = ["tests/bdd/steps/**/*.ts", "tests/bdd/fixtures.ts"];

const mockedTestDir = defineBddConfig({
	features,
	steps,
	outputDir: "tests/bdd/.features-gen/mocked",
});

const integrationTestDir = defineBddConfig({
	features,
	steps,
	// Fault-injection scenarios cannot be reproduced against a real database.
	tags: "not @mocked-only",
	outputDir: "tests/bdd/.features-gen/integration",
});

export default defineConfig({
	reporter: [["list"]],
	globalTeardown: "./tests/bdd/support/globalTeardown.ts",
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
	],
	webServer: [
		{
			command: "tsx tests/bdd/support/testServer.ts",
			url: `${mockedURL}/health`,
			reuseExistingServer: !process.env.CI,
			env: { BDD_PORT: String(mockedPort), JWT_SECRET },
		},
		{
			command:
				"npm run db:test:prepare && tsx tests/bdd/support/integrationServer.ts",
			url: `${integrationURL}/health`,
			reuseExistingServer: !process.env.CI,
			timeout: 180_000,
			env: {
				BDD_PORT: String(integrationPort),
				JWT_SECRET,
				DATABASE_URL: TEST_DATABASE_URL,
			},
		},
	],
});
