import type { Request, Response } from "express";
import Logger from "../lib/logger";
import type { CatalogueService } from "../services/catalogueService";

export class CatalogueController {
	constructor(private readonly service: CatalogueService) {}

	async getAll(_req: Request, res: Response): Promise<void> {
		try {
			res.status(200).json(await this.service.getAll());
		} catch (error) {
			Logger.error(`Failed to fetch catalogue: ${String(error)}`);
			res.status(500).json({ error: "Failed to fetch catalogue" });
		}
	}
}
