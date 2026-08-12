import type { Band } from "./Band";
import type { Capability } from "./Capability";
import type { Status } from "./Status";

export class JobRole {
	constructor(
		public readonly id: number,
		public readonly roleName: string,
		public readonly description: string,
		public readonly responsibilities: string,
		public readonly sharepointUrl: string,
		public readonly location: string,
		public readonly capability: Capability,
		public readonly capabilityId: number,
		public readonly band: Band,
		public readonly bandId: number,
		public readonly closingDate: Date,
		public readonly status: Status,
		public readonly statusId: number,
		public readonly numberOfOpenPositions: number,
	) {
		if (!Number.isInteger(id) || id <= 0) {
			throw new Error("JobRole id must be a positive integer");
		}
		if (roleName.trim().length === 0) {
			throw new Error("JobRole roleName is required");
		}
		if (description.trim().length === 0) {
			throw new Error("JobRole description is required");
		}
		if (responsibilities.trim().length === 0) {
			throw new Error("JobRole responsibilities is required");
		}
		if (sharepointUrl.trim().length === 0) {
			throw new Error("JobRole sharepointUrl is required");
		}
		if (location.trim().length === 0) {
			throw new Error("JobRole location is required");
		}
		if (!Number.isInteger(capabilityId) || capabilityId <= 0) {
			throw new Error("JobRole capabilityId must be a positive integer");
		}
		if (!Number.isInteger(bandId) || bandId <= 0) {
			throw new Error("JobRole bandId must be a positive integer");
		}
		if (Number.isNaN(closingDate.getTime())) {
			throw new Error("JobRole closingDate must be a valid date");
		}
		if (!Number.isInteger(statusId) || statusId <= 0) {
			throw new Error("JobRole statusId must be a positive integer");
		}
		if (!Number.isInteger(numberOfOpenPositions) || numberOfOpenPositions < 0) {
			throw new Error(
				"JobRole numberOfOpenPositions must be a non-negative integer",
			);
		}
	}
}
