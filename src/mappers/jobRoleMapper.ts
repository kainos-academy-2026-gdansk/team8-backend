import type { Prisma } from "../generated/prisma/client";
import { Band } from "../models/Band";
import { Capability } from "../models/Capability";
import { JobRole } from "../models/JobRole";
import type {
	JobRoleDetailedResponse,
	JobRoleResponse,
} from "../dtos/JobRoleDto";
import { Status } from "../models/Status";

type PrismaJobRoleWithRelations = Prisma.JobRoleGetPayload<{
	include: { capability: true; band: true; status: true };
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

export function mapJobRoleToJobRoleDetailedResponse(
	jobRole: JobRole,
): JobRoleDetailedResponse {
	return {
		id: jobRole.id,
		roleName: jobRole.roleName,
		description: jobRole.description,
		responsibilities: jobRole.responsibilities,
		sharepointUrl: jobRole.sharepointUrl,
		location: jobRole.location,
		capability: jobRole.capability,
		band: jobRole.band,
		closingDate: jobRole.closingDate,
		status: jobRole.status,
		numberOfOpenPositions: jobRole.numberOfOpenPositions,
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
		prismaJobRole.description,
		prismaJobRole.responsibilities,
		prismaJobRole.sharepointUrl,
		prismaJobRole.location,
		new Capability(prismaJobRole.capability.id, prismaJobRole.capability.name),
		prismaJobRole.capabilityId,
		new Band(prismaJobRole.band.id, prismaJobRole.band.name),
		prismaJobRole.bandId,
		prismaJobRole.closingDate,
		new Status(prismaJobRole.status.id, prismaJobRole.status.name),
		prismaJobRole.statusId,
		prismaJobRole.numberOfOpenPositions,
	);
}
