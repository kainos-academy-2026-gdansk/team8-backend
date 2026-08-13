import type { RegisterResponseDto } from "../dtos/UserDto";

export interface UserDao {
	emailExists(email: string): Promise<boolean>;
	register(email: string, password: string): Promise<RegisterResponseDto>;
}
