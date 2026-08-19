import { z } from 'zod';

// Roles allowed in the system
const UserRoleEnum = z.enum(['admin', 'investor', 'startup']);

export const registerSchema = {
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    full_name: z.string().min(2, 'Full name is required'),
    phone: z.string().optional(),
    role: UserRoleEnum,
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
};
