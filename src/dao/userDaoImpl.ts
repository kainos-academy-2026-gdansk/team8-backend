import type { RegisterResponseDto } from "../dtos/UserDto";
import { fromPrismaUserRole } from "../mappers/userMapper";
import prisma from "../prismaClient";
import type { UserDao } from "./userDao";


export class UserDaoImpl implements UserDao {
    async emailExists(email: string): Promise<boolean> {
        return !!await prisma.user.findUnique({ where: { email } }); 
    }

    async register(email: string, password: string): Promise<RegisterResponseDto> {
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: password,
            },
        });
        return { email: user.email, role: fromPrismaUserRole(user.role) };
    }
}   