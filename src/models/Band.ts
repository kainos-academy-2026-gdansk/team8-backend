import { JobRole } from "./jobRole";

export class Band {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly jobRoles: JobRole[]
    ) {
        if (!Number.isInteger(id) || id < 0) {
            throw new Error('Band id must be a non-negative integer');
        }
        if (name.trim().length === 0) {
            throw new Error('Band name is required');
        }
    }
}   
