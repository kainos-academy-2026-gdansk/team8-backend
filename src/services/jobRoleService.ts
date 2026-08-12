import type { JobRoleDao } from "../dao/jobRoleDao";
import {
	mapJobRoleToJobRoleResponses,
	mapJobRoleToJobRoleDetailedResponse,
} from "../mappers/jobRoleMapper";
import type {
	JobRoleResponse,
	JobRoleDetailedResponse,
} from "../dtos/JobRoleDto";

export class JobRoleService {
	constructor(private dao: JobRoleDao) {}

	async getAll(): Promise<JobRoleResponse[]> {
		const jobRoles = await this.dao.getAll();
		return mapJobRoleToJobRoleResponses(jobRoles);
	}

	async getById(id: number): Promise<JobRoleDetailedResponse | null> {
		const jobRole = await this.dao.getById(id);
		return jobRole ? mapJobRoleToJobRoleDetailedResponse(jobRole) : null;
	}
}
