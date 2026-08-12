import type { RegisterRequestDto } from "../dtos/UserDto";
import prisma from "../prismaClient";
import type { UserDao } from "./userDao";


export class UserDaoImpl implements UserDao {
    async emailExists(email: string): Promise<boolean> {
        return prisma.user.findUnique({
            where: { email },
        }).then(user => !!user);
    }

    async register(input: RegisterRequestDto): Promise<void> {
        await prisma.user.create({
            data: {
                email: input.email,
                passwordHash: input.password,
            },
        });
    }
}   