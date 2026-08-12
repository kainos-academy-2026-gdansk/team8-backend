import argon2 from "argon2";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserDaoImpl } from "../../src/dao/userDaoImpl";
import { AuthService } from "../../src/services/authService";

vi.mock("argon2", () => ({
	default: {
		hash: vi.fn(),
	},
}));

describe("AuthService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("throws when passwords do not match", async () => {
		const dao = {
			emailExists: vi.fn(),
			register: vi.fn(),
		} as unknown as UserDaoImpl;

		const service = new AuthService(dao);

		await expect(
			service.register({
				email: "john.doe@example.com",
				password: "StrongPass!1",
				confirmPassword: "DifferentPass!1",
			}),
		).rejects.toThrow("Passwords do not match");

		expect(dao.emailExists).not.toHaveBeenCalled();
		expect(dao.register).not.toHaveBeenCalled();
		expect(argon2.hash).not.toHaveBeenCalled();
	});

	it("throws when email already exists", async () => {
		const dao = {
			emailExists: vi.fn().mockResolvedValue(true),
			register: vi.fn(),
		} as unknown as UserDaoImpl;

		const service = new AuthService(dao);

		await expect(
			service.register({
				email: "john.doe@example.com",
				password: "StrongPass!1",
				confirmPassword: "StrongPass!1",
			}),
		).rejects.toThrow("Email already exists");

		expect(dao.emailExists).toHaveBeenCalledWith("john.doe@example.com");
		expect(dao.register).not.toHaveBeenCalled();
		expect(argon2.hash).not.toHaveBeenCalled();
	});

	it("hashes password and registers user when input is valid", async () => {
		vi.mocked(argon2.hash).mockResolvedValue("hashed-password");

		const dao = {
			emailExists: vi.fn().mockResolvedValue(false),
			register: vi.fn().mockResolvedValue(undefined),
		} as unknown as UserDaoImpl;

		const service = new AuthService(dao);

		await service.register({
			email: "john.doe@example.com",
			password: "StrongPass!1",
			confirmPassword: "StrongPass!1",
		});

		expect(dao.emailExists).toHaveBeenCalledWith("john.doe@example.com");
		expect(argon2.hash).toHaveBeenCalledWith("StrongPass!1");
		expect(dao.register).toHaveBeenCalledWith({
			email: "john.doe@example.com",
			password: "hashed-password",
			confirmPassword: "StrongPass!1",
		});
	});

	it("propagates hashing errors", async () => {
		vi.mocked(argon2.hash).mockRejectedValue(new Error("Hash error"));

		const dao = {
			emailExists: vi.fn().mockResolvedValue(false),
			register: vi.fn(),
		} as unknown as UserDaoImpl;

		const service = new AuthService(dao);

		await expect(
			service.register({
				email: "john.doe@example.com",
				password: "StrongPass!1",
				confirmPassword: "StrongPass!1",
			}),
		).rejects.toThrow("Hash error");

		expect(dao.register).not.toHaveBeenCalled();
	});
});
