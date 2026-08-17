import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getAllMock = vi.fn();
const getByIdMock = vi.fn();
const createMock = vi.fn();
const catalogueMock = vi.fn();

vi.mock("../../src/middleware/requireAuth", () => ({
	requireAuth: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock("../../src/services/jobRoleService", () => {
	class MockJobRoleService {
		getAll(params: unknown) {
			return getAllMock(params);
		}

		getById(id: number) {
			return getByIdMock(id);
		}

		create(input: unknown) {
			return createMock(input);
		}
	}

	return {
		JobRoleService: MockJobRoleService,
	};
});

vi.mock("../../src/services/catalogueService", () => ({
	CatalogueService: class {
		getAll() {
			return catalogueMock();
		}
	},
}));

import app from "../../src/app";

describe("GET /api/job-roles", () => {
	beforeEach(() => {
		getAllMock.mockReset();
		getByIdMock.mockReset();
		createMock.mockReset();
		catalogueMock.mockReset();
	});

	it("returns job roles list with status 200", async () => {
		const mockedResponse = {
			data: [
				{
					id: 1,
					roleName: "Software Engineer",
					location: "Gdansk",
					capability: { id: 1, name: "Engineering" },
					band: { id: 2, name: "B2" },
					closingDate: "2026-12-31T00:00:00.000Z",
					status: { id: 1, name: "OPEN" },
				},
			],
			total: 11,
			limit: 10,
			offset: 0,
			hasPrevious: false,
			hasNext: true,
			lastOffset: 10,
		};

		getAllMock.mockResolvedValueOnce(mockedResponse);

		const response = await request(app).get("/api/job-roles");

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			data: mockedResponse.data,
			total: 11,
			limit: 10,
			offset: 0,
			links: {
				first: "/api/job-roles?limit=10&offset=0",
				previous: null,
				next: "/api/job-roles?limit=10&offset=10",
				last: "/api/job-roles?limit=10&offset=10",
			},
		});
		expect(getAllMock).toHaveBeenCalledWith({
			pagination: { limit: 10, offset: 0 },
			filters: {},
		});
	});

	it("accepts pagination query params", async () => {
		getAllMock.mockResolvedValueOnce({
			data: [],
			total: 25,
			limit: 5,
			offset: 10,
			hasPrevious: true,
			hasNext: true,
			lastOffset: 20,
		});

		const response = await request(app).get("/api/job-roles?limit=5&offset=10");

		expect(response.status).toBe(200);
		expect(getAllMock).toHaveBeenCalledWith({
			pagination: { limit: 5, offset: 10 },
			filters: {},
		});
		expect(response.body.links).toEqual({
			first: "/api/job-roles?limit=5&offset=0",
			previous: "/api/job-roles?limit=5&offset=5",
			next: "/api/job-roles?limit=5&offset=15",
			last: "/api/job-roles?limit=5&offset=20",
		});
	});

	it("accepts start query param as alias for offset", async () => {
		getAllMock.mockResolvedValueOnce({
			data: [],
			total: 25,
			limit: 5,
			offset: 10,
			hasPrevious: true,
			hasNext: true,
			lastOffset: 20,
		});

		const response = await request(app).get("/api/job-roles?limit=5&start=10");

		expect(response.status).toBe(200);
		expect(getAllMock).toHaveBeenCalledWith({
			pagination: { limit: 5, offset: 10 },
			filters: {},
		});
	});

	it("returns status 400 for invalid pagination query params", async () => {
		const response = await request(app).get("/api/job-roles?limit=0&offset=-1");

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			error:
				"limit must be a positive integer and offset must be a non-negative integer",
		});
		expect(getAllMock).not.toHaveBeenCalled();
	});

	it("returns status 500 when service fails", async () => {
		getAllMock.mockRejectedValueOnce(new Error("Database unavailable"));

		const response = await request(app).get("/api/job-roles");

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ error: "Failed to fetch job roles" });
		expect(getAllMock).toHaveBeenCalledTimes(1);
	});

	it("forwards text filters using case-insensitive contains semantics", async () => {
		getAllMock.mockResolvedValueOnce({
			data: [],
			total: 0,
			limit: 0,
			offset: 0,
			hasPrevious: false,
			hasNext: false,
			lastOffset: 0,
			filtered: true,
		});

		await request(app).get("/api/job-roles?roleName=engineer&location=gdansk");

		expect(getAllMock).toHaveBeenCalledWith({
			pagination: { limit: 10, offset: 0 },
			filters: { roleName: "engineer", location: "gdansk" },
		});
	});

	it("parses repeated name params into arrays matched by name", async () => {
		getAllMock.mockResolvedValueOnce({
			data: [],
			total: 0,
			limit: 0,
			offset: 0,
			hasPrevious: false,
			hasNext: false,
			lastOffset: 0,
			filtered: true,
		});

		await request(app).get(
			"/api/job-roles?capability=Engineering&capability=Delivery&band=B2&status=OPEN",
		);

		expect(getAllMock).toHaveBeenCalledWith({
			pagination: { limit: 10, offset: 0 },
			filters: {
				capabilities: ["Engineering", "Delivery"],
				bands: ["B2"],
				statuses: ["OPEN"],
			},
		});
	});

	it("treats a single name param as a one-element list", async () => {
		getAllMock.mockResolvedValueOnce({
			data: [],
			total: 0,
			limit: 0,
			offset: 0,
			hasPrevious: false,
			hasNext: false,
			lastOffset: 0,
			filtered: true,
		});

		await request(app).get("/api/job-roles?capability=Engineering");

		expect(getAllMock).toHaveBeenCalledWith({
			pagination: { limit: 10, offset: 0 },
			filters: { capabilities: ["Engineering"] },
		});
	});

	it("forwards a closing date range", async () => {
		getAllMock.mockResolvedValueOnce({
			data: [],
			total: 0,
			limit: 0,
			offset: 0,
			hasPrevious: false,
			hasNext: false,
			lastOffset: 0,
			filtered: true,
		});

		await request(app).get(
			"/api/job-roles?closingDateAfter=2026-01-01&closingDateBefore=2026-12-31",
		);

		expect(getAllMock).toHaveBeenCalledWith({
			pagination: { limit: 10, offset: 0 },
			filters: {
				closingDateAfter: new Date("2026-01-01"),
				closingDateBefore: new Date("2026-12-31"),
			},
		});
	});

	it("silently ignores invalid filter values without returning 400", async () => {
		getAllMock.mockResolvedValueOnce({
			data: [],
			total: 0,
			limit: 0,
			offset: 0,
			hasPrevious: false,
			hasNext: false,
			lastOffset: 0,
			filtered: false,
		});

		const response = await request(app).get(
			"/api/job-roles?closingDateAfter=not-a-date&roleName=%20%20",
		);

		expect(response.status).toBe(200);
		expect(getAllMock).toHaveBeenCalledWith({
			pagination: { limit: 10, offset: 0 },
			filters: {},
		});
	});

	it("bypasses pagination and returns all matching rows with null previous/next links", async () => {
		getAllMock.mockResolvedValueOnce({
			data: [
				{
					id: 1,
					roleName: "Software Engineer",
					location: "Gdansk",
					capability: { id: 1, name: "Engineering" },
					band: { id: 2, name: "B2" },
					closingDate: "2026-12-31T00:00:00.000Z",
					status: { id: 1, name: "OPEN" },
				},
			],
			total: 1,
			limit: 1,
			offset: 0,
			hasPrevious: false,
			hasNext: false,
			lastOffset: 0,
			filtered: true,
		});

		const response = await request(app).get(
			"/api/job-roles?limit=5&offset=100&capability=Engineering",
		);

		expect(response.status).toBe(200);
		expect(response.body.total).toBe(1);
		expect(response.body.data).toHaveLength(1);
		expect(response.body.limit).toBe(1);
		expect(response.body.offset).toBe(0);
		expect(response.body.links).toEqual({
			first: "/api/job-roles?limit=1&offset=0",
			previous: null,
			next: null,
			last: "/api/job-roles?limit=1&offset=0",
		});
	});

	it("combines multiple filters", async () => {
		getAllMock.mockResolvedValueOnce({
			data: [],
			total: 0,
			limit: 0,
			offset: 0,
			hasPrevious: false,
			hasNext: false,
			lastOffset: 0,
			filtered: true,
		});

		await request(app).get(
			"/api/job-roles?roleName=engineer&capability=Engineering&status=OPEN&closingDateBefore=2026-12-31",
		);

		expect(getAllMock).toHaveBeenCalledWith({
			pagination: { limit: 10, offset: 0 },
			filters: {
				roleName: "engineer",
				capabilities: ["Engineering"],
				statuses: ["OPEN"],
				closingDateBefore: new Date("2026-12-31"),
			},
		});
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

	it("creates a job role and returns status 201", async () => {
		const created = {
			id: 8,
			roleName: "New Engineer",
			status: { id: 1, name: "OPEN" },
		};
		createMock.mockResolvedValueOnce(created);

		const response = await request(app)
			.post("/api/job-roles")
			.send({
				roleName: "New Engineer",
				description: "Build APIs",
				responsibilities: "Design services",
				sharepointUrl: "https://company.sharepoint.com/new-role",
				location: "Gdansk",
				closingDate: "2026-12-31",
				numberOfOpenPositions: 2,
				capabilityId: 1,
				bandId: 2,
			});

		expect(response.status).toBe(201);
		expect(response.body).toEqual(created);
		expect(createMock).toHaveBeenCalledWith({
			roleName: "New Engineer",
			description: "Build APIs",
			responsibilities: "Design services",
			sharepointUrl: "https://company.sharepoint.com/new-role",
			location: "Gdansk",
			closingDate: new Date("2026-12-31T00:00:00.000Z"),
			numberOfOpenPositions: 2,
			capabilityId: 1,
			bandId: 2,
		});
	});

	it("rejects invalid create data with status 400", async () => {
		const response = await request(app).post("/api/job-roles").send({});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({ error: "Invalid job role data" });
		expect(createMock).not.toHaveBeenCalled();
	});

	it("returns approved band and capability catalogues", async () => {
		catalogueMock.mockResolvedValue([{ id: 1, name: "Cloud" }]);

		const bands = await request(app).get("/api/bands");
		const capabilities = await request(app).get("/api/capabilities");

		expect(bands.status).toBe(200);
		expect(bands.body).toEqual([{ id: 1, name: "Cloud" }]);
		expect(capabilities.status).toBe(200);
		expect(capabilities.body).toEqual([{ id: 1, name: "Cloud" }]);
	});
});
