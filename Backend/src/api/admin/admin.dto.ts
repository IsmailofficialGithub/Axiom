import { z } from 'zod';

export const createSubsidiarySchema = {
  body: z.object({
    name: z.string().min(2, 'Subsidiary name is required'),
    country: z.string().min(2, 'Country is required'),
  }),
};

export const updateSubsidiarySchema = {
  body: z.object({
    name: z.string().min(2, 'Subsidiary name is required').optional(),
    description: z.string().optional(),
  }),
};

export const createUserSchema = {
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    full_name: z.string().min(2, 'Full name is required'),
    role: z.enum(['startup', 'investor', 'admin', 'member']),
    status: z.enum(['pending', 'active', 'rejected']).default('active'),
    // Startup-specific fields
    industry: z.string().optional(),
    current_arr: z.number().optional(),
    funding_sought: z.number().optional(),
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

export const createOpportunitySchema = {
  body: z.object({
    title: z.string().min(2, 'Title is required'),
    company_id: z.string().uuid().optional().nullable(),
    subsidiary_id: z.string().uuid().optional().nullable(),
    category: z.string().optional(),
    description: z.string().optional(),
    expected_revenue: z.number().optional(),
    stage: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
  }),
};

export const updateOpportunitySchema = {
  body: z.object({
    title: z.string().min(2).optional(),
    company_id: z.string().uuid().optional().nullable(),
    subsidiary_id: z.string().uuid().optional().nullable(),
    category: z.string().optional(),
    description: z.string().optional(),
    expected_revenue: z.number().optional(),
    stage: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
};
