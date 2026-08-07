import { Capability } from './Capability';
import { Band } from './Band';

export class JobRole {
    constructor(
        public readonly id: number,
        public readonly roleName: string,
        public readonly location: string,
        public readonly capability: Capability,
        public readonly band: Band,
        public readonly closingDate: Date,
        public readonly status: 'open' | 'closed',
    ) {
        if (!Number.isInteger(id) || id < 0) {
            throw new Error('JobRole id must be a non-negative integer');
        }
        if (roleName.trim().length === 0) {
            throw new Error('JobRole roleName is required');
        }
        if (location.trim().length === 0) {
            throw new Error('JobRole location is required');
        }
        if (!(capability instanceof Capability)) {
            throw new Error('JobRole capability must be a valid Capability instance');
        }
        if (!(band instanceof Band)) {
            throw new Error('JobRole band must be a valid Band instance');
        }
        if (Number.isNaN(closingDate.getTime())) {
            throw new Error('JobRole closingDate must be a valid date');
        }
        if (status !== 'open' && status !== 'closed') {
            throw new Error("JobRole status must be either 'open' or 'closed'");
        }
    }
}
