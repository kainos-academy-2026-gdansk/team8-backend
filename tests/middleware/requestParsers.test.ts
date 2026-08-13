import { describe, expect, it } from "vitest";
import {
	parseIntegerWithDefault,
	parseOptionalDate,
	parseOptionalString,
	parseRequiredInteger,
	parseStringList,
} from "../../src/middleware/requestParsers";

describe("parseIntegerWithDefault", () => {
	it("returns default value when param is undefined", () => {
		expect(
			parseIntegerWithDefault(undefined, { defaultValue: 10, min: 1 }),
		).toBe(10);
	});

	it("returns parsed integer when valid", () => {
		expect(parseIntegerWithDefault("5", { defaultValue: 10, min: 1 })).toBe(5);
	});

	it("returns null for arrays", () => {
		expect(
			parseIntegerWithDefault(["5"], { defaultValue: 10, min: 1 }),
		).toBeNull();
	});

	it("returns null for non-integer values", () => {
		expect(
			parseIntegerWithDefault("2.5", { defaultValue: 10, min: 1 }),
		).toBeNull();
	});

	it("returns null for values below min", () => {
		expect(
			parseIntegerWithDefault("0", { defaultValue: 10, min: 1 }),
		).toBeNull();
	});
});

describe("parseRequiredInteger", () => {
	it("returns null when param is undefined", () => {
		expect(parseRequiredInteger(undefined, { min: 1 })).toBeNull();
	});

	it("returns null for arrays", () => {
		expect(parseRequiredInteger(["3"], { min: 1 })).toBeNull();
	});

	it("returns parsed integer when valid", () => {
		expect(parseRequiredInteger("3", { min: 1 })).toBe(3);
	});

	it("returns null for values below min", () => {
		expect(parseRequiredInteger("0", { min: 1 })).toBeNull();
	});

	it("returns null for non-integer values", () => {
		expect(parseRequiredInteger("abc", { min: 1 })).toBeNull();
	});
});

describe("parseOptionalString", () => {
	it("returns undefined when param is undefined", () => {
		expect(parseOptionalString(undefined)).toBeUndefined();
	});

	it("returns undefined for arrays", () => {
		expect(parseOptionalString(["a"])).toBeUndefined();
	});

	it("trims and returns the string when non-empty", () => {
		expect(parseOptionalString("  Engineer  ")).toBe("Engineer");
	});

	it("returns undefined for empty or whitespace-only strings", () => {
		expect(parseOptionalString("   ")).toBeUndefined();
	});
});

describe("parseStringList", () => {
	it("returns undefined when param is undefined", () => {
		expect(parseStringList(undefined)).toBeUndefined();
	});

	it("wraps a single string value in a one-element array", () => {
		expect(parseStringList("Engineering")).toEqual(["Engineering"]);
	});

	it("normalizes an array, trimming and dropping empty entries", () => {
		expect(parseStringList([" Engineering ", "", "Delivery", "   "])).toEqual([
			"Engineering",
			"Delivery",
		]);
	});

	it("ignores non-string entries", () => {
		expect(parseStringList(["Engineering", 5])).toEqual(["Engineering"]);
	});

	it("returns undefined when nothing valid remains", () => {
		expect(parseStringList(["", "   "])).toBeUndefined();
	});
});

describe("parseOptionalDate", () => {
	it("returns undefined when param is undefined", () => {
		expect(parseOptionalDate(undefined)).toBeUndefined();
	});

	it("returns undefined for arrays", () => {
		expect(parseOptionalDate(["2026-01-01"])).toBeUndefined();
	});

	it("parses a valid date string", () => {
		const result = parseOptionalDate("2026-12-31");
		expect(result).toBeInstanceOf(Date);
		expect(result?.toISOString()).toBe("2026-12-31T00:00:00.000Z");
	});

	it("returns undefined for invalid date strings", () => {
		expect(parseOptionalDate("not-a-date")).toBeUndefined();
	});

	it("returns undefined for empty strings", () => {
		expect(parseOptionalDate("   ")).toBeUndefined();
	});
});
