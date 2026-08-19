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
    startup_profile: z.object({
      industry: z.string().optional(),
      stage: z.string().optional(),
      current_arr: z.number().optional(),
      last_year_revenue: z.number().optional(),
      revenue_model: z.string().optional(),
      funding_sought: z.number().optional(),
      primary_use_of_funds: z.string().optional(),
      previous_funding: z.number().optional(),
      custom_qa: z.record(z.any()).optional(),
    }).optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
};
