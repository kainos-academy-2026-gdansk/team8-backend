import type { RegisterRequestDto, RegisterResponseDto } from "../dtos/UserDto";
import prisma from "../prismaClient";
import type { UserDao } from "./userDao";


export class UserDaoImpl implements UserDao {
    async emailExists(email: string): Promise<boolean> {
        return !!await prisma.user.findUnique({ where: { email } }); 
    }

    async register(input: RegisterRequestDto): Promise<RegisterResponseDto> {
        const user = await prisma.user.create({
            data: {
                email: input.email,
                passwordHash: input.password,
            },
    });
        return { email: user.email, password: user.passwordHash };
    }
}   