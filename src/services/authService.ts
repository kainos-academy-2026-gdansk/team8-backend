import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { UserDao } from "../dao/userDao";
import type {
	LoginRequestDto,
	RegisterRequestDto,
	RegisterResponseDto,
} from "../dtos/UserDto";

const LOGIN_ERROR = "Invalid email or password";

export class AuthError extends Error {
	public constructor(
		public readonly statusCode: number,
		message: string,
	) {
		super(message);
	}
}

export class AuthService {
	constructor(private userDao: UserDao) {}

	public async register(
		input: RegisterRequestDto,
	): Promise<RegisterResponseDto> {
		if (await this.userDao.emailExists(input.email)) {
			throw new Error("Email already exists");
		}

		const hashedPassword = await argon2.hash(input.password);
		const user = await this.userDao.register(input.email, hashedPassword);
		return user;
	}

	public async login(input: LoginRequestDto): Promise<string> {
		const user = await this.userDao.login(input.email);

		if (!user) {
			throw new AuthError(401, LOGIN_ERROR);
		}

		const validPassword = await argon2.verify(
			user.passwordHash,
			input.password,
		);

		if (!validPassword) {
			throw new AuthError(401, LOGIN_ERROR);
		}

		const secret = process.env.JWT_SECRET;

		if (!secret) {
			throw new Error("JWT_SECRET is not configured");
		}

		return jwt.sign(
			{ userId: user.id, email: user.email, role: user.role },
			secret,
			{
				expiresIn: "1h",
			},
		);
	}
}
