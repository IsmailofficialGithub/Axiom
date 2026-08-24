import * as dealRoomService from './deal-room.service.js';
import ApiError from '../../utils/ApiError.js';
export const addDocument = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId || !userRole)
            throw new ApiError(401, 'Unauthorized');
        const opportunityId = req.params.opportunityId;
        if (!opportunityId)
            throw new ApiError(400, 'Opportunity ID is required');
        const document = await dealRoomService.addDocument(userId, userRole, opportunityId, req.body);
        res.status(201).json({
            message: 'Document added to deal room successfully',
            data: document,
        });
    }
    catch (error) {
        next(error);
    }
};
export const listDocuments = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId || !userRole)
            throw new ApiError(401, 'Unauthorized');
        const opportunityId = req.params.opportunityId;
        if (!opportunityId)
            throw new ApiError(400, 'Opportunity ID is required');
        const documents = await dealRoomService.listDocuments(opportunityId, userRole, userId);
        res.status(200).json({ data: documents });
    }
    catch (error) {
        next(error);
    }
};
export const grantAccess = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId || !userRole)
            throw new ApiError(401, 'Unauthorized');
        const opportunityId = req.params.opportunityId;
        if (!opportunityId)
            throw new ApiError(400, 'Opportunity ID is required');
        const permission = await dealRoomService.grantAccess(userId, userRole, opportunityId, req.body.investor_id);
        res.status(201).json({
            message: 'Access granted successfully',
            data: permission,
        });
    }
    catch (error) {
        next(error);
    }
};
export const listInvestors = async (req, res, next) => {
    try {
        const investors = await dealRoomService.listActiveInvestors();
        res.status(200).json({ data: investors });
    }
    catch (error) {
        next(error);
    }
};
