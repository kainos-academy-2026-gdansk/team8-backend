import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/jobRoleController";
import Logger from "../../src/lib/logger";
import type { JobRoleService } from "../../src/services/jobRoleService";


vi.mock("../../src/lib/logger", () => ({
	default: {
		error: vi.fn(),
	},
}));

describe("JobRoleController", () => {
	it("returns status 200 with job roles when service succeeds", async () => {
		const jobRoles = [
			{
				id: 1,
				roleName: "Software Engineer",
				location: "Gdansk",
				capability: { id: 1, name: "Engineering" },
				band: { id: 2, name: "B2" },
				closingDate: new Date("2026-12-31T00:00:00.000Z"),
				status: "OPEN",
			},
		];

		const service = {
			getAll: vi.fn().mockResolvedValue(jobRoles),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(service);
		const req = {} as Request;
		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.getAll(req, res);

		expect(service.getAll).toHaveBeenCalledTimes(1);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(jobRoles);
	});

	it("returns status 500 when service throws", async () => {
		const service = {
			getAll: vi.fn().mockRejectedValue(new Error("DB down")),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(service);
		const req = {} as Request;
		const res = {
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
});
