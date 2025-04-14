import { Router } from 'express';
import dotenv from 'dotenv';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import isAuthenticated from '../middlewares/AdminAuthMiddleware.mjs';
import DashboardService from '../services/DashboadService.mjs';

dotenv.config();
const router = Router();
const dashboardService = new DashboardService();

/**
 * @swagger
 * /api/v1/auth/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard data
 *     description: Retrieves dashboard statistics for the admin. Requires authentication via session cookie.
 *     tags:
 *       - Admin
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Admin dashboard
 *                 data:
 *                   type: object
 *                   properties:
 *                     adminCount:
 *                       type: integer
 *                       example: 1
 *                     userCount:
 *                       type: integer
 *                       example: 1
 *                     subscriptionTypesCount:
 *                       type: integer
 *                       example: 3
 *                     apiKeyCount:
 *                       type: integer
 *                       example: 1
 *                     errorCount:
 *                       type: integer
 *                       example: 161
 *                     subscriptionUserCount:
 *                       type: integer
 *                       example: 0
 *                     apiKeyUsage:
 *                       type: integer
 *                       example: 0
 *                     onlineAdminsCount:
 *                       type: integer
 *                       example: 1
 *                     onlineUsersCount:
 *                       type: integer
 *                       example: 1
 *                     income:
 *                       type: number
 *                       format: float
 *                       example: 0
 *                 errors:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Authentication failed
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example: { "redirect": "/api/v1/auth/admin/login" }
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: string
 *                   nullable: true
 *                   example: null
 * 
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const dashboard = await dashboardService.getAdminDashboard();
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
