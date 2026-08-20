import prisma from "../prismaClient";
import type { CatalogueDao } from "./catalogueDao";

export class CapabilityDaoImpl implements CatalogueDao {
	async getAll() {
		return prisma.capability.findMany({
			select: { id: true, name: true },
			orderBy: { name: "asc" },
		});
	}
}

export class BandDaoImpl implements CatalogueDao {
	async getAll() {
		return prisma.band.findMany({
			select: { id: true, name: true },
			orderBy: { name: "asc" },
		});
	}
}
