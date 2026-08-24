import * as oppsService from './opportunities.service.js';
import ApiError from '../../utils/ApiError.js';
export const create = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new ApiError(401, 'Unauthorized');
        const opportunity = await oppsService.createOpportunity(userId, req.body);
        res.status(201).json({
            message: 'Opportunity created successfully',
            data: opportunity,
        });
    }
    catch (error) {
        next(error);
    }
};
export const list = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId || !userRole)
            throw new ApiError(401, 'Unauthorized');
        const filters = {
            category: req.query.category,
        };
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        console.log(`[API] list opportunities - role: ${userRole}, userId: ${userId}, filters:`, filters);
        const opportunities = await oppsService.listOpportunities(userRole, userId, filters);
        console.log(`[API] list opportunities returned ${opportunities.length} records`);
        res.status(200).json({ data: opportunities });
    }
    catch (error) {
        next(error);
    }
};
export const getById = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId || !userRole)
            throw new ApiError(401, 'Unauthorized');
        const opportunity = await oppsService.getOpportunityById(req.params.id, userRole, userId);
        res.status(200).json({ data: opportunity });
    }
    catch (error) {
        next(error);
    }
};
export const update = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId || !userRole)
            throw new ApiError(401, 'Unauthorized');
        const updated = await oppsService.updateOpportunity(req.params.id, userId, userRole, req.body);
        res.status(200).json({
            message: 'Opportunity updated successfully',
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
};
