import type { Band } from "./Band";
import type { Capability } from "./Capability";

export class JobRoleResponse {
	constructor(
		public readonly id: number,
		public readonly roleName: string,
		public readonly location: string,
		public readonly capability: Capability,
		public readonly band: Band,
		public readonly closingDate: Date,
		public readonly status: "OPEN" | "CLOSED",
	){}
}
