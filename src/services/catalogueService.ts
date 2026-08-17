import type { CatalogueItemResponse } from "../dtos/CatalogueDto";
import type { CatalogueDao } from "../dao/catalogueDao";

export class CatalogueService {
	constructor(private readonly dao: CatalogueDao) {}

	getAll(): Promise<CatalogueItemResponse[]> {
		return this.dao.getAll();
	}
}