import { z } from 'zod';
export const uploadDocumentSchema = {
    body: z.object({
        file_url: z.string().url('Must be a valid URL'),
        file_type: z.string().min(1, 'File type is required (e.g. pdf, docx)'),
        visibility: z.enum(['public', 'granted_only', 'admin_only']).default('admin_only'),
    }),
};
export const grantPermissionSchema = {
    body: z.object({
        investor_id: z.string().uuid('Invalid investor ID'),
    }),
};
