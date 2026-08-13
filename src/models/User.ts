import type { UserRole } from "./UserRole";

export class User {
	constructor(
		public readonly id: number,
		public readonly email: string,
		public readonly passwordHash: string,
		public readonly role: UserRole,
		public readonly createdAt: Date,
	) {
		if (!Number.isInteger(id) || id < 0) {
			throw new Error("User id must be a non-negative integer");
		}
		if (passwordHash.trim().length === 0) {
			throw new Error("User password is required");
		}
	}
}
