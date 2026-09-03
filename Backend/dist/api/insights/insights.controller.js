import * as insightsService from './insights.service.js';
export const getOverview = async (req, res, next) => {
    try {
        const overview = await insightsService.getOverview();
        res.status(200).json({
            status: 'success',
            data: overview
        });
    }
    catch (error) {
        next(error);
    }
};
export const getTopOpportunities = async (req, res, next) => {
    try {
        const userRole = req.user?.role || 'startup';
        const userId = req.user?.id || '';
        const filters = { sector: req.query.sector };
        const topOpportunities = await insightsService.getTopOpportunities(userRole, userId, filters);
        res.status(200).json({
            status: 'success',
            data: topOpportunities
        });
    }
    catch (error) {
        next(error);
    }
};
export const getSectorTrends = async (req, res, next) => {
    try {
        const sector = req.query.sector || 'saas';
        const trends = await insightsService.getSectorTrends(sector);
        res.status(200).json({
            status: 'success',
            data: trends
        });
    }
    catch (error) {
        next(error);
    }
};
export const getPortfolioInsights = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }
        const portfolioData = await insightsService.getPortfolioInsights(userId);
        res.status(200).json({
            status: 'success',
            data: portfolioData
        });
    }
    catch (error) {
        next(error);
    }
};
