import type { UserRole as PrismaUserRole } from "../generated/prisma/enums";
import { UserRole } from "../models/UserRole";

export function fromPrismaUserRole(role: PrismaUserRole): UserRole {
	switch (role) {
		case "ADMIN":
			return UserRole.ADMIN;
		case "USER":
			return UserRole.USER;
	}
}