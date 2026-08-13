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
