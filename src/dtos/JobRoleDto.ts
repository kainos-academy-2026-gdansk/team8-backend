import type { Band } from "../models/Band";
import type { Capability } from "../models/Capability";

export type JobRoleResponse = {
	id: number;
	roleName: string;
	location: string;
	capability: Capability;
	band: Band;
	closingDate: Date;
	status: "OPEN" | "CLOSED";
};
