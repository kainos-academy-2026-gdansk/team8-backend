import { type APIResponse, test as base } from "@playwright/test";
import jwt from "jsonwebtoken";
import { test as bddTest } from "playwright-bdd";
import type {
	ApplicationSeed,
	JobRoleSeed,
	ScenarioState,
} from "./support/scenarioState";

export const JWT_SECRET = process.env.JWT_SECRET ?? "bdd-test-secret";

export class ApplyWorld {
	jobRoles: JobRoleSeed[] = [];
	applications: ApplicationSeed[] = [];
	failOnCreate: ScenarioState["failOnCreate"];
	authToken: string | null = null;
	currentUserId = 0;
	response!: APIResponse;
	responseBody: unknown;

	authenticateAs(userId: number): void {
		this.currentUserId = userId;
		this.authToken = jwt.sign(
			{ userId, email: `user${userId}@kainos.com`, role: "USER" },
			JWT_SECRET,
			{ expiresIn: "1h" },
		);
	}

	authHeaders(): Record<string, string> {
		return this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
	}
}

export const test = bddTest.extend<{ world: ApplyWorld }>({
	// biome-ignore lint/correctness/noEmptyPattern: Playwright fixture signature requires the deps object
	world: async ({}, use) => {
		await use(new ApplyWorld());
	},
});

export const expect = base.expect;
