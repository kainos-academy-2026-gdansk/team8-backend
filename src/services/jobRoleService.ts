import type { JobRoleDao } from "../dao/jobRoleDao";
import { mapJobRoleToJobRoleResponses } from "../mappers/jobRoleMapper";
import type { JobRoleResponse } from "../models/JobRoleResponse";

export class JobRoleService {
	constructor(private dao: JobRoleDao) {}

	async getAll(): Promise<JobRoleResponse[]> {
		const jobRoles = await this.dao.getAll();
		return mapJobRoleToJobRoleResponses(jobRoles);
	}
}
