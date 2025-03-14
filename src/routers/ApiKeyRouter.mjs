import { Router } from 'express';
import dotenv from 'dotenv';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import isAuthenticated from '../middlewares/AuthMiddleware.mjs';
import ApiKeyService from '../services/ApiKeyService.mjs';

dotenv.config();
const router = Router();
const apiKeyService = new ApiKeyService();

/**
 * @swagger
 * /api/v1/auth/user/apikey:
 *   get:
 *     summary: "Retrieve API Key"
 *     description: "Fetch the API key associated with the authenticated user."
 *     tags:
 *       - "User"
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved the API key."
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
 *                   example: "API Key"
 *                 data:
 *                   type: array
 *                   example: [{"key":"2984739870594c98x4375c98efhj43","key_name":"key 1"}]
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       401:
 *         description: "Unauthorized - User not authenticated."
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
 *                   example: "Authentication failed"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example: {"redirect":"/api/v1/auth"}
 *       500:
 *         description: "Internal server error."
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
 *                   example: "Internal server error"
 *                 data:
 *                   type: "null"
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid  # Adjust based on your Passport.js session cookie name
 */
router.get('/apikey', isAuthenticated, async (req, res) => {
    try {
        const key = await apiKeyService.getApiKeyByUserId(req.user.id);
        return res.status(200).send(StandardResponse(
            true,
            "API Key",
            key,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res);
    }
});

export default router;