import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getAllMock = vi.fn();
const getByIdMock = vi.fn();

vi.mock("../../src/services/jobRoleService", () => {
	class MockJobRoleService {
		getAll() {
			return getAllMock();
		}

		getById(id: number) {
			return getByIdMock(id);
		}
	}

	return {
		JobRoleService: MockJobRoleService,
	};
});

import app from "../../src/app";

describe("GET /api/job-roles", () => {
	beforeEach(() => {
		getAllMock.mockReset();
		getByIdMock.mockReset();
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

		const response = await request(app).get("/api/job-roles");

		expect(response.status).toBe(200);
		expect(response.body).toEqual(mockedResponse);
		expect(getAllMock).toHaveBeenCalledTimes(1);
	});

	it("returns status 500 when service fails", async () => {
		getAllMock.mockRejectedValueOnce(new Error("Database unavailable"));

		const response = await request(app).get("/api/job-roles");

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ error: "Failed to fetch job roles" });
		expect(getAllMock).toHaveBeenCalledTimes(1);
	});

	it("returns one job role with status 200", async () => {
		const mockedResponse = {
			id: 7,
			roleName: "Senior Software Engineer",
			description: "Role description",
			responsibilities: "Lead and deliver",
			sharepointUrl: "https://company.sharepoint.com/sites/job-specs/sse",
			location: "Gdansk",
			capability: { id: 1, name: "Engineering" },
			band: { id: 2, name: "B2" },
			closingDate: "2026-12-31T00:00:00.000Z",
			status: { id: 1, name: "OPEN" },
			numberOfOpenPositions: 2,
		};

		getByIdMock.mockResolvedValueOnce(mockedResponse);

		const response = await request(app).get("/api/job-roles/7");

		expect(response.status).toBe(200);
		expect(response.body).toEqual(mockedResponse);
		expect(getByIdMock).toHaveBeenCalledWith(7);
	});

	it("returns status 404 when job role is not found", async () => {
		getByIdMock.mockResolvedValueOnce(null);

		const response = await request(app).get("/api/job-roles/999");

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ error: "Job role not found" });
		expect(getByIdMock).toHaveBeenCalledWith(999);
	});

	it("returns status 400 for invalid id", async () => {
		const response = await request(app).get("/api/job-roles/not-a-number");

		expect(response.status).toBe(400);
		expect(response.body).toEqual({ error: "Id should be a positive number" });
		expect(getByIdMock).not.toHaveBeenCalled();
	});

	it("returns status 500 when getById service fails", async () => {
		getByIdMock.mockRejectedValueOnce(new Error("Database unavailable"));

		const response = await request(app).get("/api/job-roles/7");

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ error: "Failed to fetch job role" });
		expect(getByIdMock).toHaveBeenCalledWith(7);
	});
});
