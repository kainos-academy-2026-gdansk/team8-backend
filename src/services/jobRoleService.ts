import type { JobRoleDao, JobRoleListFilters } from "../dao/jobRoleDao";
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
	filtered: boolean;
};

export type JobRoleListParams = {
	pagination: JobRoleListPagination;
	filters: JobRoleListFilters;
};

function hasActiveFilters(filters: JobRoleListFilters): boolean {
	return (
		filters.roleName !== undefined ||
		filters.location !== undefined ||
		(filters.capabilities !== undefined && filters.capabilities.length > 0) ||
		(filters.bands !== undefined && filters.bands.length > 0) ||
		(filters.statuses !== undefined && filters.statuses.length > 0) ||
		filters.closingDateAfter !== undefined ||
		filters.closingDateBefore !== undefined
	);
}

export class JobRoleService {
	constructor(private dao: JobRoleDao) {}

	async getAll(params: JobRoleListParams): Promise<JobRoleListResult> {
		const { pagination, filters } = params;

		if (hasActiveFilters(filters)) {
			const jobRoles = await this.dao.getAll({ filters });
			const data = mapJobRoleToJobRoleResponses(jobRoles);

			return {
				data,
				total: data.length,
				limit: data.length,
				offset: 0,
				hasPrevious: false,
				hasNext: false,
				lastOffset: 0,
				filtered: true,
			};
		}

		const [jobRoles, total] = await Promise.all([
			this.dao.getAll({
				pagination: { limit: pagination.limit, offset: pagination.offset },
			}),
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
			filtered: false,
		};
	}

	async getById(id: number): Promise<JobRoleDetailedResponse | null> {
		const jobRole = await this.dao.getById(id);
		return jobRole ? mapJobRoleToJobRoleDetailedResponse(jobRole) : null;
	}
}

export type { JobRoleListFilters } from "../dao/jobRoleDao";
