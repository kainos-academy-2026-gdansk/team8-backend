import type { JobRole } from "../models/JobRole";

export interface JobRoleDao {
	getAll(limit: number, offset: number): Promise<JobRole[]>;
	countAll(): Promise<number>;
	getById(id: number): Promise<JobRole | null>;
}
