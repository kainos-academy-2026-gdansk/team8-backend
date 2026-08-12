import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const registerMock = vi.fn();

vi.mock("../../src/services/authService", () => {
	class MockAuthService {
		register(input: {
			email: string;
			password: string;
			confirmPassword: string;
		}) {
			return registerMock(input);
		}
	}

	return {
		AuthService: MockAuthService,
	};
});

import app from "../../src/app";

describe("POST /api/auth/register", () => {
	beforeEach(() => {
		registerMock.mockReset();
	});

	it("returns status 201 when registration succeeds", async () => {
		const payload = {
			email: "john.doe@example.com",
			password: "StrongPass!1",
			confirmPassword: "StrongPass!1",
		};
		const mockedResponse = { id: 1, email: payload.email };
		registerMock.mockResolvedValueOnce(mockedResponse);

		const response = await request(app).post("/api/auth/register").send(payload);

		expect(response.status).toBe(201);
		expect(response.body).toEqual(mockedResponse);
		expect(registerMock).toHaveBeenCalledWith(payload);
	});

	it("returns status 400 when passwords do not match", async () => {
		const response = await request(app).post("/api/auth/register").send({
			email: "john.doe@example.com",
			password: "StrongPass!1",
			confirmPassword: "WrongPass!1",
		});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({ error: "Invalid request body" });
		expect(registerMock).not.toHaveBeenCalled();
	});

	it("returns status 409 when email already exists", async () => {
		registerMock.mockRejectedValueOnce(new Error("Email already exists"));

		const response = await request(app).post("/api/auth/register").send({
			email: "john.doe@example.com",
			password: "StrongPass!1",
			confirmPassword: "StrongPass!1",
		});

		expect(response.status).toBe(409);
		expect(response.body).toEqual({ error: "Email already exists" });
	});

	it("returns status 500 when service fails unexpectedly", async () => {
		registerMock.mockRejectedValueOnce(new Error("Database unavailable"));

		const response = await request(app).post("/api/auth/register").send({
			email: "john.doe@example.com",
			password: "StrongPass!1",
			confirmPassword: "StrongPass!1",
		});

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ error: "Failed to register user" });
	});
});
