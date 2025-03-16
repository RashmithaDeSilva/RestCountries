import { Router } from 'express';
import dotenv from 'dotenv';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import isAuthenticated from '../middlewares/ApiKeyAuthMiddleware.mjs';
import CacheStoreService from '../services/CacheStoreService.mjs';
import ErrorLogService from '../services/ErrorLogService.mjs';
import CacheStoreErrors from '../utils/errors/CacheStoreErrors.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';

dotenv.config();
const router = Router();
const cacheStoreService = new CacheStoreService();
const errorLogService = new ErrorLogService();

/**
 * @swagger
 * /api/v1/auth/restcountry:
 *   get:
 *     summary: "Retrieve all countries"
 *     description: "Fetches a list of countries from cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved the list of countries."
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
 *                   example: "Rest countries all"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "United States"
 *                       code:
 *                         type: string
 *                         example: "US"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: "Invalid API key or missing authorization header."
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
 *                   example: "Invalid API key"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       401:
 *         description: "API key is required in the request header."
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
 *                   example: "API key required"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
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
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */
router.get('/', isAuthenticated, async (req, res) => {
    try {
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getAllCountries();

        } catch (cacheError) {
            // Save error on error log
            await errorLogService.createLog('/restcountry/', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch(process.env.DATA_RETRIEVE_API);
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA  } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            "Rest countries all",
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/');
    }
});

export default router;
