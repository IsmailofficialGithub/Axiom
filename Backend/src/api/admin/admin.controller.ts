import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service.js';

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.listAllUsers();
    res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
};

export const listSubsidiaries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subsidiaries = await adminService.listSubsidiaries();
    res.status(200).json({ data: subsidiaries });
  } catch (error) {
    next(error);
  }
};

export const createSubsidiary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subsidiary = await adminService.createSubsidiary(req.body);
    res.status(201).json({
      message: 'Subsidiary created successfully',
      data: subsidiary,
    });
  } catch (error) {
    next(error);
  }
};
