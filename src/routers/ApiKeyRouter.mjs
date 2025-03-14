import { Router } from 'express';
import dotenv from 'dotenv';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import isAuthenticated from '../middlewares/AuthMiddleware.mjs';
import ApiKeyService from '../services/ApiKeyService.mjs';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import ApiKeyValidationSchema from '../utils/validations/ApiKeyValidationSchema.mjs';

dotenv.config();
const router = Router();
const apiKeyService = new ApiKeyService();
const ENV = process.env.ENV;

/**
 * @swagger
 * /api/v1/auth/user/apikey:
 *   get:
 *     summary: "Retrieve API Key"
 *     description: "Fetch the API key associated with the authenticated user."
 *     tags:
 *       - "API Key"
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
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const keys = await apiKeyService.getApiKeysByUserId(req.user.id);
        return res.status(200).send(StandardResponse(
            true,
            "API Key",
            keys,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res);
    }
});

/**
 * @swagger
 * /api/v1/auth/user/changename:
 *   post:
 *     summary: "Change API key name"
 *     description: "Allows an authenticated user to change the name of their API key."
 *     tags:
 *       - API Key
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: "Request to change the name of the API key."
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               old_api_key_name:
 *                 type: string
 *                 example: "oldApiKeyName"
 *               new_api_key_name:
 *                 type: string
 *                 example: "newApiKeyName"
 *     responses:
 *       200:
 *         description: "API key name changed successfully (Works on only dev env othervice return with 204)"
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
 *                   example: "API key name change successfully."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       204:
 *         description: "No Content - Successful change with no additional response body."
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
 *       400:
 *         description: "Validation error."
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
 *                   example: "Validation error."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       404:
 *         description: "API key name does not exist."
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
 *                   example: "API key name you tried to change does not exist."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       409:
 *         description: "New API key name already in use."
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
 *                   example: "New API key name you are trying to use is already in use."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       500:
 *         description: "Internal server error (e.g., failure to generate a new API key)."
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
 *                   example: "Internal server error."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.post('/changename', isAuthenticated, [
    checkSchema({
        ...ApiKeyValidationSchema.oldApiKeyNameValidation(),
        ...ApiKeyValidationSchema.newApiKeyNameValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, null, errors);
    }

    const data = matchedData(req);

    try {
        await apiKeyService.changeApiKeyByUserIdAndName(req.user.id, data);
        
    } catch (error) {
        return await ErrorResponse(error, res);
    }

    return ENV === "DEV" ? res.status(200).send(StandardResponse(
        true,
        "API key name change successfully.",
        null,
        null
    )) : res.sendStatus(204);
});

export default router;