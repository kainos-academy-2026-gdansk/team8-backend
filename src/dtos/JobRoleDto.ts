import type { Band } from "../models/Band";
import type { Capability } from "../models/Capability";
import type { Status } from "../models/Status";

export type JobRoleResponse = {
	id: number;
	roleName: string;
	location: string;
	capability: Capability;
	band: Band;
	closingDate: Date;
	status: Status;
};

export type JobRoleDetailedResponse = {
	id: number;
	roleName: string;
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	location: string;
	capability: Capability;
	band: Band;
	closingDate: Date;
	status: Status;
	numberOfOpenPositions: number;
};

export type PaginationLinks = {
	first: string;
	previous: string | null;
	next: string | null;
	last: string;
};

export type PaginatedJobRoleResponse = {
	data: JobRoleResponse[];
	total: number;
	limit: number;
	offset: number;
	links: PaginationLinks;
};
