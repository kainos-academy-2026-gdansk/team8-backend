import { describe, expect, it } from "vitest";
import { UserRole } from "../../src/models/UserRole";
import { requireAdmin } from "../../src/middleware/requireAdmin";

function createResponse(role?: UserRole) {
	const response = {
		locals: role ? { authUser: { role } } : {},
		statusCode: 0,
		body: undefined as unknown,
		status(code: number) {
			this.statusCode = code;
			return this;
		},
		json(value: unknown) {
			this.body = value;
			return this;
		},
	};
	return response;
}

describe("requireAdmin", () => {
	it("allows Admin users", () => {
		const response = createResponse(UserRole.ADMIN);
		let nextCalled = false;

		requireAdmin({} as never, response as never, () => {
			nextCalled = true;
	});

		expect(nextCalled).toBe(true);
		expect(response.statusCode).toBe(0);
	});

	it("rejects regular users with 403", () => {
		const response = createResponse(UserRole.USER);
		let nextCalled = false;

		requireAdmin({} as never, response as never, () => {
			nextCalled = true;
	});

		expect(nextCalled).toBe(false);
		expect(response.statusCode).toBe(403);
		expect(response.body).toEqual({ error: "Admin access required" });
	});
});