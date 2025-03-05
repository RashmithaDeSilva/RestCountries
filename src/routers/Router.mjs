import { Router } from 'express';
import dotenv from 'dotenv';
import StandardResponse from '../utils/StandardResponse.mjs';

dotenv.config();
const router = Router();

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
 *                   example: "Welcome to the API. Use /api-docs for Swagger documentation."
 */
router.get('/', (req, res) => {
    res.json({ message: `Welcome to the API. Use /api/${ process.env.API_VERSION }/api-docs for Swagger documentation (Only working on Developer mode).` });
});

router.all("*", (req, res) => {
    return res.status(404).send(StandardResponse(false, "Not Found !", null, 
        `Invalid endpoint, redirect to '/api/${ process.env.API_VERSION }/auth'`));
});

export default router;
