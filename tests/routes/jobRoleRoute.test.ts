import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getAllMock = vi.fn();

vi.mock("../../src/services/jobRoleService", () => {
	class MockJobRoleService {
		getAll() {
			return getAllMock();
		}
	}

	return {
		JobRoleService: MockJobRoleService,
	};
});

import app from "../../src/app";

describe("GET /job-roles", () => {
	beforeEach(() => {
		getAllMock.mockReset();
	});

	it("returns job roles list with status 200", async () => {
		const mockedResponse = [
			{
				id: 1,
				roleName: "Software Engineer",
				location: "Gdansk",
				capability: { id: 1, name: "Engineering" },
				band: { id: 2, name: "B2" },
				closingDate: "2026-12-31T00:00:00.000Z",
				status: "OPEN",
			},
		];

		getAllMock.mockResolvedValueOnce(mockedResponse);

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.body).toEqual(mockedResponse);
		expect(getAllMock).toHaveBeenCalledTimes(1);
	});

	it("returns status 500 when service fails", async () => {
		getAllMock.mockRejectedValueOnce(new Error("Database unavailable"));

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ error: "Failed to fetch job roles" });
		expect(getAllMock).toHaveBeenCalledTimes(1);
	});
});
