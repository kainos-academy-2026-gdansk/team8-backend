import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationController } from "../../src/controllers/applicationController";
import Logger from "../../src/lib/logger";
import type { ApplicationService } from "../../src/services/applicationService";
import { ApplicationError } from "../../src/services/applicationService";

vi.mock("../../src/lib/logger", () => ({
	default: {
		error: vi.fn(),
	},
}));

describe("ApplicationController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("creates an application and returns 201", async () => {
		const service = {
			createApplication: vi.fn().mockResolvedValue({
				id: 1,
				jobRoleId: 7,
				status: "IN_PROGRESS",
				createdAt: new Date("2026-08-17T00:00:00.000Z"),
			}),
		} as unknown as ApplicationService;
		const controller = new ApplicationController(service);
		const req = { body: { cv: "encoded-cv" } } as Request;
		const res = {
			locals: { authUser: { userId: 10 }, jobRoleId: 7 },
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.create(req, res);

		expect(service.createApplication).toHaveBeenCalledWith(10, 7, {
			cv: "encoded-cv",
		});
		expect(res.status).toHaveBeenCalledWith(201);
	});

	it("returns 400 for an invalid CV body", async () => {
		const service = {
			createApplication: vi.fn(),
		} as unknown as ApplicationService;
		const controller = new ApplicationController(service);
		const req = { body: { cv: "" } } as Request;
		const res = {
			locals: { authUser: { userId: 10 }, jobRoleId: 7 },
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.create(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: "Invalid request body" });
		expect(service.createApplication).not.toHaveBeenCalled();
	});

	it("maps expected application errors", async () => {
		const service = {
			createApplication: vi
				.fn()
				.mockRejectedValue(
					new ApplicationError(
						"Job role is not available for applications",
						409,
					),
				),
		} as unknown as ApplicationService;
		const controller = new ApplicationController(service);
		const req = { body: { cv: "encoded-cv" } } as Request;
		const res = {
			locals: { authUser: { userId: 10 }, jobRoleId: 7 },
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.create(req, res);

		expect(res.status).toHaveBeenCalledWith(409);
		expect(res.json).toHaveBeenCalledWith({
			error: "Job role is not available for applications",
		});
		expect(Logger.error).not.toHaveBeenCalled();
	});
});
