import * as authService from './auth.service.js';
export const register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
};
export const checkEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ error: 'Email is required' });
        const exists = await authService.checkEmailExists(email);
        res.status(200).json({ exists });
    }
    catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const result = await authService.loginUser(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
export const getMe = async (req, res, next) => {
    try {
        // The authenticate middleware attaches the user to req.user
        res.status(200).json({ user: req.user });
    }
    catch (error) {
        next(error);
    }
};
export const updateProfile = async (req, res, next) => {
    try {
        const profile = await authService.updateProfile(req.user.id, req.body);
        res.status(200).json({ message: 'Profile updated successfully', data: profile });
    }
    catch (error) {
        next(error);
    }
};
export const updatePassword = async (req, res, next) => {
    try {
        await authService.updatePassword(req.user.id, req.body.password);
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        next(error);
    }
};
