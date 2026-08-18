import { beforeEach, describe, expect, it, vi } from "vitest";

const { findManyMock } = vi.hoisted(() => ({ findManyMock: vi.fn() }));

vi.mock("../../src/prismaClient", () => ({
	default: {
		jobRole: {
			findMany: findManyMock,
		},
	},
}));

import { JobRoleDaoImpl } from "../../src/dao/jobRoleDaoImpl";

describe("JobRoleDaoImpl ordering", () => {
	beforeEach(() => {
		findManyMock.mockReset();
		findManyMock.mockResolvedValue([]);
	});

	it("retains id ordering when no ordering is requested", async () => {
		await new JobRoleDaoImpl().getAll({});

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({ orderBy: [{ id: "asc" }] }),
		);
	});

	it.each([
		["roleName", { roleName: "desc" }],
		["location", { location: "desc" }],
		["closingDate", { closingDate: "desc" }],
		["capability", { capability: { name: "desc" } }],
		["band", { band: { name: "desc" } }],
		["status", { status: { name: "desc" } }],
	] as const)("maps %s to Prisma ordering", async (field, primaryOrder) => {
		await new JobRoleDaoImpl().getAll({
			ordering: { field, direction: "desc" },
		});

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				orderBy: [primaryOrder, { id: "asc" }],
			}),
		);
	});

	it("uses ascending chronological ordering for closing date", async () => {
		await new JobRoleDaoImpl().getAll({
			ordering: { field: "closingDate", direction: "asc" },
		});

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				orderBy: [{ closingDate: "asc" }, { id: "asc" }],
			}),
		);
	});
});
