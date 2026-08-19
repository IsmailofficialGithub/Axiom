import { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service.js';
import ApiError from '../../utils/ApiError.js';

export const onboardUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      throw new ApiError(401, 'Unauthorized');
    }

    const result = await usersService.onboardUser(userId, role, req.body);
    res.status(201).json({
      message: 'Onboarding completed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      throw new ApiError(401, 'Unauthorized');
    }

    const profile = await usersService.getUserProfile(userId, role);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};
