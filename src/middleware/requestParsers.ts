type ParseIntegerWithDefaultOptions = {
	defaultValue: number;
	min: number;
};

type ParseRequiredIntegerOptions = {
	min: number;
};

export function parseIntegerWithDefault(
	param: unknown,
	options: ParseIntegerWithDefaultOptions,
): number | null {
	if (param === undefined) {
		return options.defaultValue;
	}

	if (Array.isArray(param)) {
		return null;
	}

	const value = Number(param);
	if (!Number.isInteger(value) || value < options.min) {
		return null;
	}

	return value;
}

export function parseOptionalString(param: unknown): string | undefined {
	if (typeof param !== "string") {
		return undefined;
	}

	const trimmed = param.trim();
	return trimmed.length === 0 ? undefined : trimmed;
}

export function parseStringList(param: unknown): string[] | undefined {
	if (param === undefined) {
		return undefined;
	}

	const raw = Array.isArray(param) ? param : [param];
	const values = raw
		.filter((entry): entry is string => typeof entry === "string")
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);

	return values.length === 0 ? undefined : values;
}

export function parseOptionalDate(param: unknown): Date | undefined {
	if (typeof param !== "string") {
		return undefined;
	}

	const trimmed = param.trim();
	if (trimmed.length === 0) {
		return undefined;
	}

	const value = new Date(trimmed);
	return Number.isNaN(value.getTime()) ? undefined : value;
}

export function parseRequiredInteger(
	param: unknown,
	options: ParseRequiredIntegerOptions,
): number | null {
	if (param === undefined || Array.isArray(param)) {
		return null;
	}

	const value = Number(param);
	if (!Number.isInteger(value) || value < options.min) {
		return null;
	}

	return value;
}
