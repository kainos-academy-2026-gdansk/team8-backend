import type { RegisterRequestDto, RegisterResponseDto } from "../dtos/UserDto";

export interface UserDao {
    emailExists(email: string): Promise<boolean>;
    register(input: RegisterRequestDto): Promise<RegisterResponseDto>;
}