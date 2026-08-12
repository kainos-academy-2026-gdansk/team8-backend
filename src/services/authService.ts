import argon2 from "argon2";
import type { UserDao } from "../dao/userDao";
import type { RegisterRequestDto, RegisterResponseDto } from "../dtos/UserDto";

export class AuthService {
    constructor(private userDao: UserDao) {}
    
    public async register(input: RegisterRequestDto): Promise<RegisterResponseDto> {
        if (await this.userDao.emailExists(input.email)) {
            throw new Error("Email already exists");
        }

        const hashedPassword = await argon2.hash(input.password);
        const user = await this.userDao.register({ ...input, password: hashedPassword });
        return user;
    }
}