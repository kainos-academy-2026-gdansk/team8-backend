import argon2 from "argon2";
import type { UserDaoImpl } from "../dao/userDaoImpl";
import type { RegisterRequestDto } from "../dtos/UserDto";

export class AuthService {
    constructor(private userDao: UserDaoImpl) {}
    
    public async register(input: RegisterRequestDto) {
        if (input.password !== input.confirmPassword) {
            throw new Error("Passwords do not match");
        }

        if (await this.userDao.emailExists(input.email)) {
            throw new Error("Email already exists");
        }

        const hashedPassword = await argon2.hash(input.password);
        await this.userDao.register({ ...input, password: hashedPassword });
    }
}