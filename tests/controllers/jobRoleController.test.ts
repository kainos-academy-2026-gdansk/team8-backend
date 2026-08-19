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
				filters: {},
			},
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.getAll(req, res);

		expect(service.getAll).toHaveBeenCalledWith({
			pagination: { limit: 10, offset: 0 },
			filters: {},
		});
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

	it("returns all matching rows with null previous/next links when filtering", async () => {
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
			total: 1,
			limit: 1,
			offset: 0,
			hasPrevious: false,
			hasNext: false,
			lastOffset: 0,
			filtered: true,
		};

		const service = {
			getAll: vi.fn().mockResolvedValue(jobRoles),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(service);
		const req = {
			query: { roleName: "engineer" },
			baseUrl: "/api/job-roles",
		} as unknown as Request;
		const res = {
			locals: {
				pagination: { limit: 10, offset: 0 },
				filters: { roleName: "engineer" },
			},
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.getAll(req, res);

		expect(service.getAll).toHaveBeenCalledWith({
			pagination: { limit: 10, offset: 0 },
			filters: { roleName: "engineer" },
		});
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			data: jobRoles.data,
			total: 1,
			limit: 1,
			offset: 0,
			links: {
				first: "/api/job-roles?limit=1&offset=0",
				previous: null,
				next: null,
				last: "/api/job-roles?limit=1&offset=0",
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

	it("adds applicant data when the requester is an admin", async () => {
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
		const applicationService = {
			getApplicationsByJobRole: vi.fn().mockResolvedValue([
				{
					id: 3,
					jobRoleId: 1,
					applicantEmail: "applicant@example.com",
					cv: "encoded-cv",
					status: "IN_PROGRESS",
					createdAt: new Date("2026-08-17T00:00:00.000Z"),
				},
			]),
		};

		const controller = new JobRoleController(service, applicationService as never);
		const req = { params: { id: "1" } } as unknown as Request;
		const res = {
			locals: { jobRoleId: 1, authUser: { role: "ADMIN" } },
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.getById(req, res);

		expect(applicationService.getApplicationsByJobRole).toHaveBeenCalledWith(1);
		expect(res.json).toHaveBeenCalledWith({
			...jobRole,
			applications: [
				{
					id: 3,
					jobRoleId: 1,
					applicantEmail: "applicant@example.com",
					cv: "encoded-cv",
					status: "IN_PROGRESS",
					createdAt: new Date("2026-08-17T00:00:00.000Z"),
				},
			],
		});
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
