import { mapPrismaJobRoleToJobRole } from "../mappers/jobRoleMapper";
import type { JobRole } from "../models/JobRole";
import prisma from "../prismaClient";
import type { JobRoleDao } from "./jobRoleDao";

export class JobRoleDaoImpl implements JobRoleDao {
	async getAll(): Promise<JobRole[]> {
		const jobs = await prisma.jobRole.findMany({
			include: { capability: true, band: true },
		});

		return jobs.map(mapPrismaJobRoleToJobRole);
	}
}
