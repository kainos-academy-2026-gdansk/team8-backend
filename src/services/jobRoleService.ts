import type { JobRoleDao } from "../dao/jobRoleDao";
import {
	mapJobRoleToJobRoleResponses,
	mapJobRoleToJobRoleDetailedResponse,
} from "../mappers/jobRoleMapper";
import type {
	JobRoleDetailedResponse,
	JobRoleResponse,
} from "../dtos/JobRoleDto";

export type JobRoleListPagination = {
	limit: number;
	offset: number;
};

export type JobRoleListResult = {
	data: JobRoleResponse[];
	total: number;
	limit: number;
	offset: number;
	hasPrevious: boolean;
	hasNext: boolean;
	lastOffset: number;
};

export class JobRoleService {
	constructor(private dao: JobRoleDao) {}

	async getAll(pagination: JobRoleListPagination): Promise<JobRoleListResult> {
		const [jobRoles, total] = await Promise.all([
			this.dao.getAll(pagination.limit, pagination.offset),
			this.dao.countAll(),
		]);

		const lastOffset =
			total === 0
				? 0
				: Math.floor((total - 1) / pagination.limit) * pagination.limit;

		return {
			data: mapJobRoleToJobRoleResponses(jobRoles),
			total,
			limit: pagination.limit,
			offset: pagination.offset,
			hasPrevious: pagination.offset > 0,
			hasNext: pagination.offset + pagination.limit < total,
			lastOffset,
		};
	}

	async getById(id: number): Promise<JobRoleDetailedResponse | null> {
		const jobRole = await this.dao.getById(id);
		return jobRole ? mapJobRoleToJobRoleDetailedResponse(jobRole) : null;
	}
}
