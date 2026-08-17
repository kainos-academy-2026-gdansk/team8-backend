import type { JobRoleDao, JobRoleListFilters } from "../dao/jobRoleDao";
import {
	mapJobRoleToJobRoleResponses,
	mapJobRoleToJobRoleDetailedResponse,
} from "../mappers/jobRoleMapper";
import type {
	JobRoleDetailedResponse,
	JobRoleResponse,
} from "../dtos/JobRoleDto";
import type { CreateJobRoleRequest } from "../dtos/JobRoleDto";

export class JobRoleInputError extends Error {}
export class JobRoleNotFoundError extends Error {}

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

	async create(input: CreateJobRoleRequest): Promise<JobRoleDetailedResponse> {
		const [capabilityExists, bandExists, statusId] = await Promise.all([
			this.dao.getCapabilityById(input.capabilityId),
			this.dao.getBandById(input.bandId),
			this.dao.getOpenStatusId(),
		]);

		if (!capabilityExists) {
			throw new JobRoleNotFoundError("Capability not found");
		}
		if (!bandExists) {
			throw new JobRoleNotFoundError("Band not found");
		}
		if (statusId === null) {
			throw new JobRoleInputError("Open status is not configured");
		}

		const jobRole = await this.dao.create({ ...input, statusId });
		return mapJobRoleToJobRoleDetailedResponse(jobRole);
	}
}

export type { JobRoleListFilters } from "../dao/jobRoleDao";
