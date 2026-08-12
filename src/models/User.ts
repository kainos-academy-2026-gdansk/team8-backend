import type { UserRole } from "./UserRole";

export class User {
    constructor(
        public readonly id: number,
        public readonly email: string,
        public readonly passwordHash: string,
        public readonly role: UserRole,
        public readonly createdAt: Date,
    ) {
        if (!Number.isInteger(id) || id < 0) {
            throw new Error("User id must be a non-negative integer");
        }
        if (passwordHash.trim().length === 0) {
            throw new Error("User password is required");
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("Invalid email format");
        }
        const hasUppercase = /[A-Z]/.test(passwordHash);
        const hasLowercase = /[a-z]/.test(passwordHash);
        const hasSpecialCharacter = /[^A-Za-z0-9]/.test(passwordHash);
        if (
            passwordHash.length <= 8 ||
            !hasUppercase ||
            !hasLowercase ||
            !hasSpecialCharacter
        ) {
            throw new Error(
                "User password must be longer than 8 characters and include uppercase, lowercase, and special characters",
            );
        }
    }
}