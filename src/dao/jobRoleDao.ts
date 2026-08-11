import type { JobRole } from "../models/JobRole";

export interface JobRoleDao {
	getAll(): Promise<JobRole[]>;
}
