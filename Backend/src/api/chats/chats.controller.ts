import { Request, Response, NextFunction } from 'express';
import * as chatsService from './chats.service.js';

export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, investor_id, startup_id } = req.body;
    const adminId = req.user!.id;
    const room = await chatsService.createChatRoom(name, adminId, investor_id, startup_id);
    res.status(201).json({
      message: 'Chat room created successfully',
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

export const listRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const rooms = await chatsService.listChatRoomsForUser(userId, role);
    res.status(200).json({ data: rooms });
  } catch (error) {
    next(error);
  }
};

export const getRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const room = await chatsService.getChatRoomById(req.params.id as string, userId, role);
    res.status(200).json({ data: room });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await chatsService.deleteChatRoom(req.params.id as string);
    res.status(200).json({ message: 'Chat room deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const messages = await chatsService.listMessages(req.params.id as string, userId, role);
    res.status(200).json({ data: messages });
  } catch (error) {
    next(error);
  }
};

export const postMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = req.user!.id;
    const role = req.user!.role;
    const { message } = req.body;
    const msg = await chatsService.postMessage(req.params.id as string, senderId, role, message);
    res.status(201).json({ data: msg });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const settings = req.body;
    const room = await chatsService.updateChatSettings(req.params.id as string, adminId, settings);
    res.status(200).json({
      message: 'Chat settings updated successfully',
      data: room,
    });
  } catch (error) {
    next(error);
  }
};
