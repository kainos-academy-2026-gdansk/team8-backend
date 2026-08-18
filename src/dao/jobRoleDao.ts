import type { JobRole } from "../models/JobRole";

export type JobRoleListFilters = {
	roleName?: string;
	location?: string;
	capabilities?: string[];
	bands?: string[];
	statuses?: string[];
	closingDateAfter?: Date;
	closingDateBefore?: Date;
};

export type JobRoleSortField =
	| "roleName"
	| "location"
	| "capability"
	| "band"
	| "closingDate"
	| "status";

export type JobRoleOrdering = {
	field: JobRoleSortField;
	direction: "asc" | "desc";
};

export type JobRoleListQueryOptions = {
	pagination?: { limit: number; offset: number };
	filters?: JobRoleListFilters;
	ordering?: JobRoleOrdering;
};

export interface JobRoleDao {
	getAll(options: JobRoleListQueryOptions): Promise<JobRole[]>;
	countAll(filters?: JobRoleListFilters): Promise<number>;
	getById(id: number): Promise<JobRole | null>;
}
