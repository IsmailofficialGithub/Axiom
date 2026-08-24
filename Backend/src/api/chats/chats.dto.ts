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
