import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthError } from "../../src/services/authService";

const registerMock = vi.fn();
const loginMock = vi.fn();

vi.mock("../../src/services/authService", () => {
	class MockAuthError extends Error {
		constructor(
			public readonly statusCode: number,
			message: string,
		) {
			super(message);
		}
	}

	class MockAuthService {
		register(input: {
			email: string;
			password: string;
			confirmPassword: string;
		}) {
			return registerMock(input);
		}

		login(input: { email: string; password: string }) {
			return loginMock(input);
		}
	}

	return {
		AuthError: MockAuthError,
		AuthService: MockAuthService,
	};
});

import app from "../../src/app";

describe("POST /api/auth/register", () => {
	beforeEach(() => {
		registerMock.mockReset();
		loginMock.mockReset();
	});

	it("returns status 201 when registration succeeds", async () => {
		const payload = {
			email: "john.doe@example.com",
			password: "StrongPass!1",
			confirmPassword: "StrongPass!1",
		};
		const mockedResponse = { email: payload.email, role: "USER" };
		registerMock.mockResolvedValueOnce(mockedResponse);

		const response = await request(app)
			.post("/api/auth/register")
			.send(payload);

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

describe("POST /api/auth/login", () => {
	beforeEach(() => {
		loginMock.mockReset();
	});

	it("returns status 200 when login succeeds", async () => {
		const payload = {
			email: "john.doe@example.com",
			password: "StrongPass!1",
		};
		loginMock.mockResolvedValueOnce("jwt-token");

		const response = await request(app).post("/api/auth/login").send(payload);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ token: "jwt-token" });
		expect(loginMock).toHaveBeenCalledWith(payload);
	});

	it("returns status 401 when credentials are invalid", async () => {
		loginMock.mockRejectedValueOnce(
			new AuthError(401, "Invalid email or password"),
		);

		const response = await request(app).post("/api/auth/login").send({
			email: "john.doe@example.com",
			password: "WrongPass!1",
		});

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ error: "Invalid email or password" });
	});
});
