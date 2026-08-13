import { mapPrismaJobRoleToJobRole } from "../mappers/jobRoleMapper";
import type { JobRole } from "../models/JobRole";
import prisma from "../prismaClient";
import type { JobRoleDao } from "./jobRoleDao";

export class JobRoleDaoImpl implements JobRoleDao {
	async getAll(limit: number, offset: number): Promise<JobRole[]> {
		const jobs = await prisma.jobRole.findMany({
			take: limit,
			skip: offset,
			orderBy: { id: "asc" },
			include: { capability: true, band: true, status: true },
		});

		return jobs.map(mapPrismaJobRoleToJobRole);
	}

	async countAll(): Promise<number> {
		return prisma.jobRole.count();
	}

	async getById(id: number): Promise<JobRole | null> {
		const job = await prisma.jobRole.findUnique({
			where: { id },
			include: { capability: true, band: true, status: true },
		});

		return job ? mapPrismaJobRoleToJobRole(job) : null;
	}
}
