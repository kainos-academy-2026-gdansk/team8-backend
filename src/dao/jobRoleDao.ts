import type { JobRole } from "../models/JobRole";

export interface JobRoleDao {
	getAll(): Promise<JobRole[]>;
	getById(id: number): Promise<JobRole | null>;
}
