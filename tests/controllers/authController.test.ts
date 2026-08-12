import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthController } from "../../src/controllers/authController";
import Logger from "../../src/lib/logger";
import type { AuthService } from "../../src/services/authService";

vi.mock("../../src/lib/logger", () => ({
	default: {
		debug: vi.fn(),
		error: vi.fn(),
	},
}));

describe("AuthController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns status 201 when registration succeeds", async () => {
		const user = { email: "john.doe@example.com", password: "hashed-password" };
		const body = {
			email: "john.doe@example.com",
			password: "StrongPass!1",
			confirmPassword: "StrongPass!1",
		};

		const service = {
			register: vi.fn().mockResolvedValue(user),
		} as unknown as AuthService;

		const controller = new AuthController(service);
		const req = { body } as Request;
		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.register(req, res);

		expect(service.register).toHaveBeenCalledWith(body);
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith(user);
		expect(Logger.debug).toHaveBeenCalledTimes(1);
	});

	it("returns status 400 when schema validation fails", async () => {
		const service = {
			register: vi.fn(),
		} as unknown as AuthService;

		const controller = new AuthController(service);
		const req = {
			body: {
				email: "john.doe@example.com",
				password: "StrongPass!1",
				confirmPassword: "DifferentPass!1",
			},
		} as Request;
		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.register(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: "Invalid request body" });
		expect(service.register).not.toHaveBeenCalled();
	});

	it("returns status 409 when email already exists", async () => {
		const service = {
			register: vi.fn().mockRejectedValue(new Error("Email already exists")),
		} as unknown as AuthService;

		const controller = new AuthController(service);
		const req = {
			body: {
				email: "john.doe@example.com",
				password: "StrongPass!1",
				confirmPassword: "StrongPass!1",
			},
		} as Request;
		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.register(req, res);

		expect(res.status).toHaveBeenCalledWith(409);
		expect(res.json).toHaveBeenCalledWith({ error: "Email already exists" });
		expect(Logger.error).not.toHaveBeenCalled();
	});

	it("returns status 500 when registration fails with unexpected error", async () => {
		const service = {
			register: vi.fn().mockRejectedValue(new Error("Database down")),
		} as unknown as AuthService;

		const controller = new AuthController(service);
		const req = {
			body: {
				email: "john.doe@example.com",
				password: "StrongPass!1",
				confirmPassword: "StrongPass!1",
			},
		} as Request;
		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		await controller.register(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: "Failed to register user" });
		expect(Logger.error).toHaveBeenCalledTimes(1);
	});
});
