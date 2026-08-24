import * as adminService from './admin.service.js';
export const listUsers = async (req, res, next) => {
    try {
        const users = await adminService.listAllUsers();
        res.status(200).json({ data: users });
    }
    catch (error) {
        next(error);
    }
};
export const getUserDetails = async (req, res, next) => {
    try {
        const user = await adminService.getUserById(req.params.id);
        res.status(200).json({ data: user });
    }
    catch (error) {
        next(error);
    }
};
export const listSubsidiaries = async (req, res, next) => {
    try {
        const subsidiaries = await adminService.listSubsidiaries();
        res.status(200).json({ data: subsidiaries });
    }
    catch (error) {
        next(error);
    }
};
export const createSubsidiary = async (req, res, next) => {
    try {
        const subsidiary = await adminService.createSubsidiary(req.body);
        res.status(201).json({
            message: 'Subsidiary created successfully',
            data: subsidiary,
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateSubsidiary = async (req, res, next) => {
    try {
        const subsidiary = await adminService.updateSubsidiary(req.params.id, req.body);
        res.status(200).json({ message: 'Subsidiary updated successfully', data: subsidiary });
    }
    catch (error) {
        next(error);
    }
};
export const deleteSubsidiary = async (req, res, next) => {
    try {
        await adminService.deleteSubsidiary(req.params.id);
        res.status(200).json({ message: 'Subsidiary deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
export const createUser = async (req, res, next) => {
    try {
        const user = await adminService.createUser(req.body);
        res.status(201).json({ message: 'User created successfully', data: user });
    }
    catch (error) {
        next(error);
    }
};
export const updateUser = async (req, res, next) => {
    try {
        const user = await adminService.updateUser(req.params.id, req.body);
        res.status(200).json({ message: 'User updated successfully', data: user });
    }
    catch (error) {
        next(error);
    }
};
export const deleteUser = async (req, res, next) => {
    try {
        await adminService.deleteUser(req.params.id);
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
export const updateUserPassword = async (req, res, next) => {
    try {
        await adminService.updateUserPassword(req.params.id, req.body.password);
        res.status(200).json({ message: 'User password updated successfully' });
    }
    catch (error) {
        next(error);
    }
};
export const listOpportunities = async (req, res, next) => {
    try {
        const opps = await adminService.listOpportunities();
        res.status(200).json({ data: opps });
    }
    catch (error) {
        next(error);
    }
};
export const createOpportunity = async (req, res, next) => {
    try {
        const opp = await adminService.createOpportunity(req.body, req.user.id);
        res.status(201).json({ message: 'Opportunity created successfully', data: opp });
    }
    catch (error) {
        next(error);
    }
};
export const updateOpportunity = async (req, res, next) => {
    try {
        const opp = await adminService.updateOpportunity(req.params.id, req.body);
        res.status(200).json({ message: 'Opportunity updated successfully', data: opp });
    }
    catch (error) {
        next(error);
    }
};
export const deleteOpportunity = async (req, res, next) => {
    try {
        await adminService.deleteOpportunity(req.params.id);
        res.status(200).json({ message: 'Opportunity deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
export const getAdminStats = async (req, res, next) => {
    try {
        const stats = await adminService.getAdminStats();
        res.status(200).json({ data: stats });
    }
    catch (error) {
        next(error);
    }
};
export const impersonateUser = async (req, res, next) => {
    try {
        const sessionData = await adminService.impersonateUser(req.params.id);
        res.status(200).json({
            message: 'Impersonation session established successfully',
            data: sessionData
        });
    }
    catch (error) {
        next(error);
    }
};
