import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import { UserRole } from "../../src/models/UserRole";
import { requireAuth } from "../../src/middleware/requireAuth";

vi.mock("jsonwebtoken", () => ({
	default: { verify: vi.fn() },
}));

function createResponse() {
	return {
		locals: {} as Record<string, unknown>,
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
}

describe("requireAuth role claims", () => {
	beforeEach(() => {
		vi.mocked(jwt.verify).mockReset();
		process.env.JWT_SECRET = "test-secret";
	});

	it("exposes a valid Admin role to downstream middleware", () => {
		vi.mocked(jwt.verify).mockReturnValue({
			userId: 1,
			email: "admin@admin.com",
			role: UserRole.ADMIN,
		});
		const response = createResponse();
		let nextCalled = false;

		requireAuth(
			{ header: () => "Bearer valid-token" } as never,
			response as never,
			() => {
				nextCalled = true;
			},
		);

		expect(nextCalled).toBe(true);
		expect(response.locals.authUser).toEqual({
			userId: 1,
			email: "admin@admin.com",
			role: UserRole.ADMIN,
		});
	});

	it("rejects a token without a valid role", () => {
		vi.mocked(jwt.verify).mockReturnValue({
			userId: 1,
			email: "person@example.com",
		});
		const response = createResponse();
		let nextCalled = false;

		requireAuth(
			{ header: () => "Bearer token-without-role" } as never,
			response as never,
			() => {
				nextCalled = true;
			},
		);

		expect(nextCalled).toBe(false);
		expect(response.statusCode).toBe(401);
	});
});
