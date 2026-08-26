import { Router } from 'express';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/authenticate.middleware.js';
import authorize from '../../middleware/authorize.middleware.js';
import { createChatRoomSchema, postMessageSchema, updateChatSettingsSchema } from './chats.dto.js';
import * as chatsController from './chats.controller.js';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

// 1. List user's chat rooms
router.get('/', chatsController.listRooms);

// 2. Get specific chat room details
router.get('/:id', chatsController.getRoom);

// 3. Get messages for a specific chat room
router.get('/:id/messages', chatsController.getMessages);

// 4. Send a message in a specific chat room
router.post('/:id/messages', validate(postMessageSchema), chatsController.postMessage);

// 5. Create a new chat room (Admin only)
router.post('/', authorize('admin'), validate(createChatRoomSchema), chatsController.createRoom);

// 6. Delete a chat room (Admin only)
router.delete('/:id', authorize('admin'), chatsController.deleteRoom);

// 7. Update chat settings (Admin only)
router.patch('/:id/settings', authorize('admin'), validate(updateChatSettingsSchema), chatsController.updateSettings);

// 8. Delete a chat message (Admin only)
router.delete('/messages/:messageId', authorize('admin'), chatsController.deleteMessage);

export default router;
