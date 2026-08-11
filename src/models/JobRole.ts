import type { Band } from "./Band";
import type { Capability } from "./Capability";

export class JobRole {
	constructor(
		public readonly id: number,
		public readonly roleName: string,
		public readonly location: string,
		public readonly capability: Capability,
		public readonly capabilityId: number,
		public readonly band: Band,
		public readonly bandId: number,
		public readonly closingDate: Date,
		public readonly status: "OPEN" | "CLOSED",
	) {
		if (!Number.isInteger(id) || id < 0) {
			throw new Error("JobRole id must be a non-negative integer");
		}
		if (roleName.trim().length === 0) {
			throw new Error("JobRole roleName is required");
		}
		if (location.trim().length === 0) {
			throw new Error("JobRole location is required");
		}
		if (!Number.isInteger(capabilityId) || capabilityId < 0) {
			throw new Error("JobRole capabilityId must be a non-negative integer");
		}
		if (!Number.isInteger(bandId) || bandId < 0) {
			throw new Error("JobRole bandId must be a non-negative integer");
		}
		if (Number.isNaN(closingDate.getTime())) {
			throw new Error("JobRole closingDate must be a valid date");
		}
		if (status !== "OPEN" && status !== "CLOSED") {
			throw new Error("JobRole status must be either 'OPEN' or 'CLOSED'");
		}
	}
}
