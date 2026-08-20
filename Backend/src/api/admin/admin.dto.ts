import { z } from 'zod';

export const createSubsidiarySchema = {
  body: z.object({
    name: z.string().min(2, 'Subsidiary name is required'),
    country: z.string().min(2, 'Country is required'),
  }),
};

export const updateUserSchema = {
  body: z.object({
    role: z.enum(['startup', 'investor', 'admin', 'member']).optional(),
    status: z.enum(['pending', 'active', 'rejected']).optional(),
    full_name: z.string().min(2).optional(),
  }),
};

export const updateUserPasswordSchema = {
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
};
