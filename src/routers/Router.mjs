import { Router } from 'express';
import dotenv from 'dotenv';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import AuthRouter from './AuthRouter.mjs';
import UserRouter from './UserRouter.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import ApiKeyRouter from './ApiKeyRouter.mjs';

dotenv.config();
const router = Router();
router.use('/auth/', AuthRouter);
router.use('/auth/user', UserRouter);
router.use('/auth/user/apikey', ApiKeyRouter);
const API_VERSION = process.env.API_VERSION;

/**
 * @swagger
 * /api/v1/:
 *   get:
 *     summary: Get API description
 *     description: Returns a simple description of the API.
 *     responses:
 *       200:
 *         description: A brief API description.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome to the API."
 */
router.get('/', (req, res) => {
    let msg = `Welcome to the API, Use '/api/${ API_VERSION }/auth' to get authenticator for use this API.`;

    if (process.env.ENV === "DEV") {
        msg = `Welcome to the API, Use '/api/${ API_VERSION }/api-docs' for Swagger documentation (Only working on Developer mode).`;
    }
    res.status(200).send(StandardResponse(true, msg, null, null));
});

/**
 * @swagger
 * /api/v1/{any}:
 *   all:
 *     summary: Invalid endpoint
 *     description: Handles all undefined routes and returns a 404 error.
 *     parameters:
 *       - in: path
 *         name: any
 *         required: true
 *         schema:
 *           type: string
 *         description: Any undefined route
 *     responses:
 *       404:
 *         description: Not Found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Not Found !"
 *                 redirect:
 *                   type: string
 *                   example: "Invalid endpoint, redirect to '/api/v1/auth'"
 */
router.all("*", (req, res) => {
    return ErrorResponse(new Error(CommonErrors.NOT_FOUND), res);
});

export default router;
