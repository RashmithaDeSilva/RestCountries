import { Router } from 'express';
import dotenv from 'dotenv';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import isAuthenticated from '../middlewares/UserAuthMiddleware.mjs';
import ApiKeyService from '../services/ApiKeyService.mjs';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import ApiKeyValidationSchema from '../utils/validations/ApiKeyValidationSchema.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';

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
        return await ErrorResponse(error, res, '/apikey/');
    }
});

/**
 * @swagger
 * /api/v1/auth/user/apikey/changename:
 *   patch:
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
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
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
 *                   example: "API key not found"
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
router.patch('/changename', isAuthenticated, [
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
        await apiKeyService.changeApiKeyNameByUserIdAndName(req.user.id, data);
        
    } catch (error) {
        return await ErrorResponse(error, res, '/apikey/changename/', data);
    }

    return ENV === "DEV" ? res.status(200).send(StandardResponse(
        true,
        "API key name change successfully.",
        null,
        null
    )) : res.sendStatus(204);
});

/**
 * @swagger
 * /api/v1/auth/user/apikey/generatenewkey:
 *   patch:
 *     summary: "Generate a new API key"
 *     description: "Allows an authenticated user to generate a new API key by providing a name for it."
 *     tags:
 *       - API Key
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: "Request to generate a new API key."
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               api_key_name:
 *                 type: string
 *                 example: "newApiKey"
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
 *     responses:
 *       200:
 *         description: "API key generated successfully."
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
 *                   example: "API key generated successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     keyName:
 *                       type: string
 *                       example: "Test key"
 *                     key:
 *                       type: string
 *                       example: "1MUadML(QYneARm)VxZBQiVL%a!e*6DOe_cR#akFfOAsF7g$i0C=@5-1BxeEdUv5"
 *                 errors:
 *                   type: "null"
 *                   example: null
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
 *                   example: "API key not found"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       204:
 *         description: "No Content - API key generated successfully with no additional response body."
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
router.patch('/generatenewkey', isAuthenticated, [
    checkSchema({
        ...ApiKeyValidationSchema.apiKeyNameValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, null, errors);
    }

    const data = matchedData(req);
    let apiKeyModel;

    try {
        apiKeyModel = await apiKeyService.generateNewApiKey(req.user.id, data);

    } catch (error) {
        return await ErrorResponse(error, res, '/apikey/generatenewkey/', data);
    }

    return ENV === "DEV" ? res.status(200).send(StandardResponse(
        true,
        "API key change successfully.",
        apiKeyModel,
        null
    )) : res.sendStatus(204);
});

/**
 * @swagger
 * /api/v1/auth/user/apikey/createnewkey:
 *   post:
 *     summary: "Create a new API key"
 *     description: "Allows an authenticated user to create a new API key by providing a name."
 *     tags:
 *       - API Key
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: "Request to create a new API key."
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               api_key_name:
 *                 type: string
 *                 example: "myNewApiKey"
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
 *     responses:
 *       200:
 *         description: "API key created successfully."
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
 *                   example: "API key created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 123
 *                     name:
 *                       type: string
 *                       example: "myNewApiKey"
 *                     key:
 *                       type: string
 *                       example: "abcd1234efgh5678"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       204:
 *         description: "No Content - API key created successfully with no additional response body."
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
 *       429:
 *         description: "Too Many Requests - API key creation limit exceeded."
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
 *                   example: "API key creation limit exceeded"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: "You have reached the maximum number of API keys allowed. Please delete an existing key or contact support."
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
router.post('/createnewkey', isAuthenticated, [
    checkSchema({
        ...ApiKeyValidationSchema.apiKeyNameValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, null, errors);
    }

    const data = matchedData(req);
    let apiKeyModel;

    try {
        apiKeyModel = await apiKeyService.createApiKey(req.user.id, data.api_key_name);

    } catch (error) {
        return await ErrorResponse(error, res, '/apikey/createnewkey/', data);
    }

    return ENV === "DEV" ? res.status(200).send(StandardResponse(
        true,
        "API key create successfully.",
        apiKeyModel,
        null
    )) : res.sendStatus(204);
});

/**
 * @swagger
 * /api/v1/auth/user/apikey/delete:
 *   delete:
 *     summary: "Delete an API key"
 *     description: "Allows an authenticated user to delete an API key by its name."
 *     tags:
 *       - API Key
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: "Request to delete an API key."
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               api_key_name:
 *                 type: string
 *                 example: "myOldApiKey"
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
 *     responses:
 *       200:
 *         description: "API key deleted successfully."
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
 *                   example: "API key deleted successfully."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       204:
 *         description: "No Content - API key deleted successfully with no additional response body."
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
 *                   example: "API key not found"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
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
router.delete('/delete', isAuthenticated, [
    checkSchema({
        ...ApiKeyValidationSchema.apiKeyNameValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, null, errors);
    }

    const data = matchedData(req);

    try {
        await apiKeyService.deleteApiKeyByUserIdAndKeyName(req.user.id, data);

    } catch (error) {
        return await ErrorResponse(error, res, '/apikey/delete/', data);
    }

    return ENV === "DEV" ? res.status(200).send(StandardResponse(
        true,
        "API key delete successfully.",
        null,
        null
    )) : res.sendStatus(204);
});

export default router;