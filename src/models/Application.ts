export type ApplicationStatus = "IN_PROGRESS" | "HIRED" | "REJECTED";

export class Application {
	constructor(
		public readonly id: number,
		public readonly userId: number,
		public readonly jobRoleId: number,
		public readonly cv: string,
		public readonly status: ApplicationStatus,
		public readonly createdAt: Date,
	) {
		if (!Number.isInteger(id) || id < 0) {
			throw new Error("Application id must be a non-negative integer");
		}
		if (!Number.isInteger(userId) || userId < 0) {
			throw new Error("Application userId must be a non-negative integer");
		}
		if (!Number.isInteger(jobRoleId) || jobRoleId < 0) {
			throw new Error("Application jobRoleId must be a non-negative integer");
		}
		if (cv.trim().length === 0) {
			throw new Error("Application CV is required");
		}
	}
}
