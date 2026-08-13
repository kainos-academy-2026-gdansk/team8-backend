import type { NextFunction, Request, Response } from "express";
import type { JobRoleListPagination } from "../services/jobRoleService";
import {
	parseIntegerWithDefault,
	parseRequiredInteger,
} from "./requestParsers";

type JobRoleListLocals = {
	pagination: JobRoleListPagination;
};

type JobRoleIdLocals = {
	jobRoleId: number;
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

export type { JobRoleListLocals, JobRoleIdLocals };
