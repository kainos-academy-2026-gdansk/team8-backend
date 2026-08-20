import type { CatalogueItemResponse } from "../dtos/CatalogueDto";

export interface CatalogueDao {
	getAll(): Promise<CatalogueItemResponse[]>;
}
