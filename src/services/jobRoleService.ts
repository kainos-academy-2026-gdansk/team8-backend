import type { JobRoleDao } from "../dao/jobRoleDao";
import { JobRoleDaoImpl } from "../dao/jobRoleDaoImpl";
import { mapJobRoleToJobRoleResponses } from "../mappers/jobRoleMapper";
import type { JobRoleResponse } from "../models/JobRoleResponse";

export class JobRoleService {
	constructor(private dao: JobRoleDao = new JobRoleDaoImpl()) {}

	async getAll(): Promise<JobRoleResponse[]> {
		const jobRoles = await this.dao.getAll();
		return mapJobRoleToJobRoleResponses(jobRoles);
	}
}
