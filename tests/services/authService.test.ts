import argon2 from "argon2";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserDao } from "../../src/dao/userDao";
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



	it("throws when email already exists", async () => {
		const dao = {
			emailExists: vi.fn().mockResolvedValue(true),
			register: vi.fn(),
		} as unknown as UserDao;

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

		const user = {
			email: "john.doe@example.com",
			password: "hashed-password",
		};

		const dao = {
			emailExists: vi.fn().mockResolvedValue(false),
			register: vi.fn().mockResolvedValue(user),
		} as unknown as UserDao;

		const service = new AuthService(dao);

		const result = await service.register({
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
		expect(result).toEqual(user);
	});

	it("propagates hashing errors", async () => {
		vi.mocked(argon2.hash).mockRejectedValue(new Error("Hash error"));

		const dao = {
			emailExists: vi.fn().mockResolvedValue(false),
			register: vi.fn(),
		} as unknown as UserDao;

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
