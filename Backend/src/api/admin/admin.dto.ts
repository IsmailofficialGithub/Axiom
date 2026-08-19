import { z } from 'zod';

export const createSubsidiarySchema = {
  body: z.object({
    name: z.string().min(2, 'Subsidiary name is required'),
    country: z.string().min(2, 'Country is required'),
  }),
};
