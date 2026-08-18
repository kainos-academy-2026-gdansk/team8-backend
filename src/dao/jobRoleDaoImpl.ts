import type { Prisma } from "../generated/prisma/client";
import { mapPrismaJobRoleToJobRole } from "../mappers/jobRoleMapper";
import type { JobRole } from "../models/JobRole";
import prisma from "../prismaClient";
import type {
	JobRoleDao,
	JobRoleListFilters,
	JobRoleListQueryOptions,
	JobRoleOrdering,
} from "./jobRoleDao";

function buildJobRoleWhere(
	filters?: JobRoleListFilters,
): Prisma.JobRoleWhereInput {
	const where: Prisma.JobRoleWhereInput = {};

	if (!filters) {
		return where;
	}

	if (filters.roleName) {
		where.roleName = { contains: filters.roleName, mode: "insensitive" };
	}

	if (filters.location) {
		where.location = { contains: filters.location, mode: "insensitive" };
	}

	if (filters.capabilities && filters.capabilities.length > 0) {
		where.capability = { name: { in: filters.capabilities } };
	}

	if (filters.bands && filters.bands.length > 0) {
		where.band = { name: { in: filters.bands } };
	}

	if (filters.statuses && filters.statuses.length > 0) {
		where.status = { name: { in: filters.statuses } };
	}

	if (filters.closingDateAfter || filters.closingDateBefore) {
		where.closingDate = {
			...(filters.closingDateAfter ? { gte: filters.closingDateAfter } : {}),
			...(filters.closingDateBefore ? { lte: filters.closingDateBefore } : {}),
		};
	}

	return where;
}

function buildJobRoleOrderBy(
	ordering?: JobRoleOrdering,
): Prisma.JobRoleOrderByWithRelationInput[] {
	if (!ordering) {
		return [{ id: "asc" }];
	}

	const relationOrderBy = {
		capability: { capability: { name: ordering.direction } },
		band: { band: { name: ordering.direction } },
		status: { status: { name: ordering.direction } },
	} as const;

	const primaryOrder =
		ordering.field in relationOrderBy
			? relationOrderBy[ordering.field as keyof typeof relationOrderBy]
			: { [ordering.field]: ordering.direction };

	return [primaryOrder, { id: "asc" }];
}

export class JobRoleDaoImpl implements JobRoleDao {
	async getAll(options: JobRoleListQueryOptions): Promise<JobRole[]> {
		const jobs = await prisma.jobRole.findMany({
			where: buildJobRoleWhere(options.filters),
			...(options.pagination
				? { take: options.pagination.limit, skip: options.pagination.offset }
				: {}),
			orderBy: buildJobRoleOrderBy(options.ordering),
			include: { capability: true, band: true, status: true },
		});

		return jobs.map(mapPrismaJobRoleToJobRole);
	}

	async countAll(filters?: JobRoleListFilters): Promise<number> {
		return prisma.jobRole.count({ where: buildJobRoleWhere(filters) });
	}

	async getById(id: number): Promise<JobRole | null> {
		const job = await prisma.jobRole.findUnique({
			where: { id },
			include: { capability: true, band: true, status: true },
		});

		return job ? mapPrismaJobRoleToJobRole(job) : null;
	}
}
