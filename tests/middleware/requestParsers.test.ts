import { describe, expect, it } from "vitest";
import {
	parseIntegerWithDefault,
	parseRequiredInteger,
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
		expect(parseIntegerWithDefault("0", { defaultValue: 10, min: 1 })).toBeNull();
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
