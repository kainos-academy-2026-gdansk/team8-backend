import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createApplicationMock } = vi.hoisted(() => ({
	createApplicationMock: vi.fn(),
}));

vi.mock("../../src/middleware/requireAuth", () => ({
	requireAuth: (
		_req: unknown,
		res: { locals: Record<string, unknown> },
		next: () => void,
	) => {
		res.locals.authUser = { userId: 10, email: "applicant@example.com" };
		next();
	},
}));

vi.mock("../../src/services/applicationService", () => ({
	ApplicationService: class {
		createApplication = createApplicationMock;
	},
	ApplicationError: class extends Error {},
}));

vi.mock("../../src/services/jobRoleService", () => ({
	JobRoleService: class {},
}));

import app from "../../src/app";

describe("POST /api/job-roles/:id/applications", () => {
	beforeEach(() => {
		createApplicationMock.mockReset();
	});

	it("creates an application for the authenticated user", async () => {
		createApplicationMock.mockResolvedValueOnce({
			id: 1,
			jobRoleId: 7,
			status: "IN_PROGRESS",
			createdAt: "2026-08-17T00:00:00.000Z",
		});

		const response = await request(app)
			.post("/api/job-roles/7/applications")
			.send({ cv: "encoded-cv" });

		expect(response.status).toBe(201);
		expect(response.body).toEqual({
			id: 1,
			jobRoleId: 7,
			status: "IN_PROGRESS",
			createdAt: "2026-08-17T00:00:00.000Z",
		});
		expect(createApplicationMock).toHaveBeenCalledWith(10, 7, {
			cv: "encoded-cv",
		});
	});

	it("returns 400 when CV is missing", async () => {
		const response = await request(app)
			.post("/api/job-roles/7/applications")
			.send({});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({ error: "Invalid request body" });
		expect(createApplicationMock).not.toHaveBeenCalled();
	});
});
