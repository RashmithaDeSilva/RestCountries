import { Router } from 'express';
import dotenv from 'dotenv';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import isAuthenticated from '../middlewares/AdminAuthMiddleware.mjs';
import DashboardService from '../services/DashboadService.mjs';

dotenv.config();
const router = Router();
const dashboardService = new DashboardService();

router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const dashboard = await dashboardService.getDashboard();
        return res.status(200).send(StandardResponse(
            true,
            "Admin dashboard details",
            dashboard,
            null
        ));
        return res.status(200).send(x);
        
    } catch (error) {
        console.log(error);
        return await ErrorResponse(error, res, '/auth/admin/dashboad');
    }
});

export default router;
