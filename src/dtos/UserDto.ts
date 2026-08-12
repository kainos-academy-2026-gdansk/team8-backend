import { z } from "zod";
import type { UserRole } from "../models/UserRole";

export const RegisterSchema = z
    .object({
        email: z.email("Invalid email format"),
        password: z
            .string()
            .min(8, "Password must be longer than 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });



export type RegisterResponseDto = {
    email: string,
    role: UserRole,
}    

export type RegisterRequestDto = z.infer<typeof RegisterSchema>;
