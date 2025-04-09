import { Router } from 'express';
import dotenv from 'dotenv';
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
            "Admin dashboard",
            dashboard,
            null
        ));
        
    } catch (error) {
        console.log(error);
        return await ErrorResponse(error, res, '/auth/admin/dashboard');
    }
});

export default router;
