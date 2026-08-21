import type { APIRequestContext } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { type ApplyWorld, expect, test } from "../fixtures";

const { Given, When, Then } = createBdd(test);

async function syncState(request: APIRequestContext, world: ApplyWorld) {
	const response = await request.put("/__test__/state", {
		data: {
			userIds: [world.currentUserId],
			jobRoles: world.jobRoles,
			applications: world.applications,
			failOnCreate: world.failOnCreate,
		},
	});
	expect(response.status()).toBe(204);
}

Given("I am authenticated as user {int}", async ({ world }, userId: number) => {
	world.authenticateAs(userId);
});

Given("I am not authenticated", async ({ world }) => {
	world.authToken = null;
});

Given(
	"job role {int} is {string} with {int} open positions",
	async ({ request, world }, id: number, status: string, positions: number) => {
		world.jobRoles = [
			{ id, statusName: status, numberOfOpenPositions: positions },
		];
		await syncState(request, world);
	},
);

Given("no job roles exist", async ({ request, world }) => {
	world.jobRoles = [];
	await syncState(request, world);
});

Given(
	"I have already applied for job role {int}",
	async ({ request, world }, jobRoleId: number) => {
		world.applications = [{ userId: world.currentUserId, jobRoleId }];
		await syncState(request, world);
	},
);

Given(
	"the application store rejects the write as a duplicate",
	async ({ request, world }) => {
		world.failOnCreate = "duplicate";
		await syncState(request, world);
	},
);

Given(
	"the application store fails unexpectedly",
	async ({ request, world }) => {
		world.failOnCreate = "unexpected";
		await syncState(request, world);
	},
);

When(
	"I apply for job role {int} with CV {string}",
	async ({ request, world }, jobRoleId: number, cv: string) => {
		world.response = await request.post(
			`/api/job-roles/${jobRoleId}/applications`,
			{ headers: world.authHeaders(), data: { cv } },
		);
		world.responseBody = await world.response.json().catch(() => null);
	},
);

When(
	"I apply for job role {string} with CV {string}",
	async ({ request, world }, jobRoleId: string, cv: string) => {
		world.response = await request.post(
			`/api/job-roles/${jobRoleId}/applications`,
			{ headers: world.authHeaders(), data: { cv } },
		);
		world.responseBody = await world.response.json().catch(() => null);
	},
);

When(
	"I apply for job role {int} with a CV of {int} characters",
	async ({ request, world }, jobRoleId: number, length: number) => {
		world.response = await request.post(
			`/api/job-roles/${jobRoleId}/applications`,
			{ headers: world.authHeaders(), data: { cv: "a".repeat(length) } },
		);
		world.responseBody = await world.response.json().catch(() => null);
	},
);

Then(
	"the response status should be {int}",
	async ({ world }, status: number) => {
		expect(world.response.status()).toBe(status);
	},
);

Then(
	"the response should contain an application for job role {int} with status {string}",
	async ({ world }, jobRoleId: number, status: string) => {
		expect(world.responseBody).toMatchObject({
			id: expect.any(Number),
			jobRoleId,
			status,
		});
	},
);

Then(
	"the response error should be {string}",
	async ({ world }, message: string) => {
		expect(world.responseBody).toMatchObject({ error: message });
	},
);

Then(
	"the stored applications should be exactly {int} for job role {int} with status {string}",
	async ({ request }, count: number, jobRoleId: number, status: string) => {
		const stored = await (await request.get("/__test__/applications")).json();
		expect(stored).toEqual(
			Array.from({ length: count }, () => ({
				userId: expect.any(Number),
				jobRoleId,
				status,
			})),
		);
	},
);
