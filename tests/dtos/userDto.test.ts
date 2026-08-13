import { describe, expect, it } from "vitest";
import { RegisterSchema } from "../../src/dtos/UserDto";

describe("RegisterSchema", () => {
	it("passes validation for valid input", () => {
		const parsed = RegisterSchema.parse({
			email: "john.doe@example.com",
			password: "StrongPass!1",
			confirmPassword: "StrongPass!1",
		});

		expect(parsed).toEqual({
			email: "john.doe@example.com",
			password: "StrongPass!1",
			confirmPassword: "StrongPass!1",
		});
	});

	it("fails when email is invalid", () => {
		const result = RegisterSchema.safeParse({
			email: "not-an-email",
			password: "StrongPass!1",
			confirmPassword: "StrongPass!1",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe("Invalid email format");
		}
	});

	it("fails when password misses uppercase letter", () => {
		const result = RegisterSchema.safeParse({
			email: "john.doe@example.com",
			password: "strongpass!1",
			confirmPassword: "strongpass!1",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				"Password must contain at least one uppercase letter",
			);
		}
	});

	it("fails when password and confirmPassword do not match", () => {
		const result = RegisterSchema.safeParse({
			email: "john.doe@example.com",
			password: "StrongPass!1",
			confirmPassword: "DifferentPass!1",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe("Passwords do not match");
			expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
		}
	});
});
