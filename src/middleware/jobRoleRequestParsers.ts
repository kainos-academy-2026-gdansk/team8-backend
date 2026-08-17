import type { NextFunction, Request, Response } from "express";
import type {
	JobRoleListFilters,
	JobRoleListPagination,
} from "../services/jobRoleService";
import type { CreateJobRoleRequest } from "../dtos/JobRoleDto";
import {
	parseIntegerWithDefault,
	parseOptionalDate,
	parseOptionalString,
	parseRequiredInteger,
	parseStringList,
} from "./requestParsers";

type JobRoleListLocals = {
	pagination: JobRoleListPagination;
	filters: JobRoleListFilters;
};

type JobRoleIdLocals = {
	jobRoleId: number;
};

type CreateJobRoleLocals = {
	createJobRole: CreateJobRoleRequest;
};

const INVALID_PAGINATION_ERROR =
	"limit must be a positive integer and offset must be a non-negative integer";

export function validateJobRoleListPagination(
	req: Request,
	res: Response<unknown, JobRoleListLocals>,
	next: NextFunction,
): void {
	const limit = parseIntegerWithDefault(req.query.limit, {
		defaultValue: 10,
		min: 1,
	});
	const offset = parseIntegerWithDefault(req.query.offset ?? req.query.start, {
		defaultValue: 0,
		min: 0,
	});

	if (limit === null || offset === null) {
		res.status(400).json({ error: INVALID_PAGINATION_ERROR });
		return;
	}

	res.locals.pagination = { limit, offset };
	next();
}

export function parseJobRoleListFilters(
	req: Request,
	res: Response<unknown, JobRoleListLocals>,
	next: NextFunction,
): void {
	res.locals.filters = {
		roleName: parseOptionalString(req.query.roleName),
		location: parseOptionalString(req.query.location),
		capabilities: parseStringList(req.query.capability),
		bands: parseStringList(req.query.band),
		statuses: parseStringList(req.query.status),
		closingDateAfter: parseOptionalDate(req.query.closingDateAfter),
		closingDateBefore: parseOptionalDate(req.query.closingDateBefore),
	};
	next();
}

export function validateJobRoleIdParam(
	req: Request,
	res: Response<unknown, JobRoleIdLocals>,
	next: NextFunction,
): void {
	const id = parseRequiredInteger(req.params.id, { min: 1 });

	if (id === null) {
		res.status(400).json({ error: "Id should be a positive number" });
		return;
	}

	res.locals.jobRoleId = id;
	next();
}

export function validateCreateJobRole(
	req: Request,
	res: Response<unknown, CreateJobRoleLocals>,
	next: NextFunction,
): void {
	const body = req.body as Record<string, unknown>;
	const roleName = parseOptionalString(body.roleName);
	const description = parseOptionalString(body.description);
	const responsibilities = parseOptionalString(body.responsibilities);
	const sharepointUrl = parseOptionalString(body.sharepointUrl);
	const location = parseOptionalString(body.location);
	const capabilityId = parseRequiredInteger(body.capabilityId, { min: 1 });
	const bandId = parseRequiredInteger(body.bandId, { min: 1 });
	const closingDate = parseOptionalDate(body.closingDate);
	const numberOfOpenPositions = parseRequiredInteger(body.numberOfOpenPositions, {
		min: 0,
	});

	if (
		!roleName ||
		!description ||
		!responsibilities ||
		!sharepointUrl ||
		!location ||
		capabilityId === null ||
		bandId === null ||
		closingDate === undefined ||
		numberOfOpenPositions === null
	) {
		res.status(400).json({ error: "Invalid job role data" });
		return;
	}

	try {
		new URL(sharepointUrl);
	} catch {
		res.status(400).json({ error: "Invalid job role data" });
		return;
	}

	res.locals.createJobRole = {
		roleName,
		description,
		responsibilities,
		sharepointUrl,
		location,
		closingDate,
		numberOfOpenPositions,
		capabilityId,
		bandId,
	};
	next();
}

export type { JobRoleListLocals, JobRoleIdLocals, CreateJobRoleLocals };
