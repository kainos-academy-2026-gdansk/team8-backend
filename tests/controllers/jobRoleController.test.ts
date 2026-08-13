import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/jobRoleController";
import Logger from "../../src/lib/logger";
import type { JobRoleService } from "../../src/services/jobRoleService";

vi.mock("../../src/lib/logger", () => ({
	default: {
		error: vi.fn(),
	},
}));

describe("JobRoleController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns status 200 with job roles when service succeeds", async () => {
		const jobRoles = {
			data: [
				{
					id: 1,
					roleName: "Software Engineer",
					location: "Gdansk",
					capability: { id: 1, name: "Engineering" },
					band: { id: 2, name: "B2" },
					closingDate: new Date("2026-12-31T00:00:00.000Z"),
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

		const service = {
			getAll: vi.fn().mockResolvedValue(jobRoles),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(service);
		const req = {
			query: {},
			baseUrl: "/api/job-roles",
		} as unknown as Request;
		const res = {
			locals: {
				pagination: { limit: 10, offset: 0 },
			},
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.getAll(req, res);

		expect(service.getAll).toHaveBeenCalledWith({ limit: 10, offset: 0 });
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			data: jobRoles.data,
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
	});

	it("returns status 500 when service throws", async () => {
		const service = {
			getAll: vi.fn().mockRejectedValue(new Error("DB down")),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(service);
		const req = {
			query: {},
		} as unknown as Request;
		const res = {
			locals: {
				pagination: { limit: 10, offset: 0 },
			},
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.getAll(req, res);

		expect(service.getAll).toHaveBeenCalledTimes(1);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			error: "Failed to fetch job roles",
		});
		expect(Logger.error).toHaveBeenCalledTimes(1);
	});

	it("returns status 200 with job role when getById succeeds", async () => {
		const jobRole = {
			id: 1,
			roleName: "Software Engineer",
			description: "Role description",
			responsibilities: "Build APIs",
			sharepointUrl: "https://company.sharepoint.com/sites/job-specs/se",
			location: "Gdansk",
			capability: { id: 1, name: "Engineering" },
			band: { id: 2, name: "B2" },
			closingDate: new Date("2026-12-31T00:00:00.000Z"),
			status: { id: 1, name: "OPEN" },
			numberOfOpenPositions: 2,
		};

		const service = {
			getById: vi.fn().mockResolvedValue(jobRole),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(service);
		const req = { params: { id: "1" } } as unknown as Request;
		const res = {
			locals: { jobRoleId: 1 },
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.getById(req, res);

		expect(service.getById).toHaveBeenCalledWith(1);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(jobRole);
	});

	it("returns status 404 when getById returns null", async () => {
		const service = {
			getById: vi.fn().mockResolvedValue(null),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(service);
		const req = { params: { id: "99" } } as unknown as Request;
		const res = {
			locals: { jobRoleId: 99 },
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.getById(req, res);

		expect(service.getById).toHaveBeenCalledWith(99);
		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ error: "Job role not found" });
	});

	it("returns status 500 when getById throws", async () => {
		const service = {
			getById: vi.fn().mockRejectedValue(new Error("DB down")),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(service);
		const req = { params: { id: "1" } } as unknown as Request;
		const res = {
			locals: { jobRoleId: 1 },
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.getById(req, res);

		expect(service.getById).toHaveBeenCalledWith(1);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			error: "Failed to fetch job role",
		});
		expect(Logger.error).toHaveBeenCalledTimes(1);
	});
});
