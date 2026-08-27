import { z } from 'zod';
export const createChatRoomSchema = {
    body: z.object({
        name: z.string().min(3, 'Chat room name must be at least 3 characters'),
        investor_id: z.string().uuid('Invalid investor ID format'),
        startup_id: z.string().uuid('Invalid startup ID format'),
    }),
};
export const postMessageSchema = {
    body: z.object({
        message: z.string().min(1, 'Message cannot be empty'),
    }),
};
export const updateChatSettingsSchema = {
    body: z.object({
        status: z.enum(['active', 'paused']).optional(),
        admin_only: z.boolean().optional(),
        is_startup_blocked: z.boolean().optional(),
        is_investor_blocked: z.boolean().optional(),
    }),
};
