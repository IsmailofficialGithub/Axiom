import { z } from 'zod';

export const onboardInvestorSchema = {
  body: z.object({
    investment_min: z.number().min(0, 'Minimum investment must be 0 or greater'),
    investment_max: z.number().min(0, 'Maximum investment must be 0 or greater'),
    preferred_industries: z.array(z.string()).min(1, 'Please select at least one industry'),
  }),
};

export const onboardStartupSchema = {
  body: z.object({
    company_name: z.string().min(2, 'Company name must be at least 2 characters'),
    industry: z.string().min(2, 'Industry is required'),
    description: z.string().min(10, 'Please provide a short description'),
    website: z.string().url('Must be a valid URL').optional(),
    stage: z.string().min(2, 'Stage is required (e.g. Seed, Series A)'),
  }),
};
