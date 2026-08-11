import type { Prisma } from "../generated/prisma/client";
import { Band } from "../models/Band";
import { Capability } from "../models/Capability";
import { JobRole } from "../models/JobRole";
import type { JobRoleResponse } from "../dtos/JobRoleDto";

type PrismaJobRoleWithRelations = Prisma.JobRoleGetPayload<{
	include: { capability: true; band: true };
}>;

export function mapJobRoleToJobRoleResponse(jobRole: JobRole): JobRoleResponse {
	return {
		id: jobRole.id,
		roleName: jobRole.roleName,
		location: jobRole.location,
		capability: jobRole.capability,
		band: jobRole.band,
		closingDate: jobRole.closingDate,
		status: jobRole.status,
	};
}

export function mapJobRoleToJobRoleResponses(
	jobRoles: JobRole[],
): JobRoleResponse[] {
	return jobRoles.map(mapJobRoleToJobRoleResponse);
}

export function mapPrismaJobRoleToJobRole(
	prismaJobRole: PrismaJobRoleWithRelations,
): JobRole {
	return new JobRole(
		prismaJobRole.id,
		prismaJobRole.roleName,
		prismaJobRole.location,
		new Capability(prismaJobRole.capability.id, prismaJobRole.capability.name),
		prismaJobRole.capabilityId,
		new Band(prismaJobRole.band.id, prismaJobRole.band.name),
		prismaJobRole.bandId,
		prismaJobRole.closingDate,
		prismaJobRole.status as "OPEN" | "CLOSED",
	);
}
