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

export type JobRoleListQueryOptions = {
	pagination?: { limit: number; offset: number };
	filters?: JobRoleListFilters;
};

export interface JobRoleDao {
	getAll(options: JobRoleListQueryOptions): Promise<JobRole[]>;
	countAll(filters?: JobRoleListFilters): Promise<number>;
	getById(id: number): Promise<JobRole | null>;
}
