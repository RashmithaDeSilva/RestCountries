import { Router } from 'express';
import dotenv from 'dotenv';
import StandardResponse from '../utils/StandardResponse.mjs';

dotenv.config();
const router = Router();
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

router.all("*", (req, res) => {
    return res.status(404).send(StandardResponse(false, "Not Found !", null, 
        `Invalid endpoint, redirect to '/api/${ API_VERSION }/auth'`));
});

export default router;
