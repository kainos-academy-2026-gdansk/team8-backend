import type { RegisterResponseDto } from "../dtos/UserDto";

export interface UserDao {
	emailExists(email: string): Promise<boolean>;
	register(email: string, passwordHash: string): Promise<RegisterResponseDto>;
	login(email: string): Promise<{
		id: number;
		email: string;
		role: string;
		passwordHash: string;
	} | null>;
}
