import { JobRole } from '../models/jobRole';
import { JobRoleResponse } from '../models/jobRoleResponse';

export function jobRoleToJobRoleResponse(jobRole: JobRole): JobRoleResponse {
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

export function jobRoleToJobRoleResponses(
    jobRoles: JobRole[]
): JobRoleResponse[] {
    return jobRoles.map(jobRoleToJobRoleResponse);
}
