import { z } from 'zod';

export const createOpportunitySchema = {
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    category: z.string().min(2, 'Category is required'),
    description: z.string().min(10, 'Please provide a short description'),
    expected_revenue: z.number().min(0, 'Expected revenue must be 0 or greater').optional(),
    currency: z.string().length(3, 'Currency must be a 3-letter code (e.g. USD)').default('USD'),
    stage: z.string().min(2, 'Stage is required (e.g. Seed, Series A)'),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
  }),
};

export const updateOpportunitySchema = {
  body: z.object({
    title: z.string().min(3).optional(),
    category: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    expected_revenue: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    stage: z.string().min(2).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
};
