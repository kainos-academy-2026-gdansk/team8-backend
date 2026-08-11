export class Band {
	constructor(
		public readonly id: number,
		public readonly name: string,
	) {
		if (!Number.isInteger(id) || id < 0) {
			throw new Error("Band id must be a non-negative integer");
		}
		if (name.trim().length === 0) {
			throw new Error("Band name is required");
		}
	}
}
