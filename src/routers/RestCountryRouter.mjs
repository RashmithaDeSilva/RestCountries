import { Router } from 'express';
import dotenv from 'dotenv';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import isAuthenticated from '../middlewares/ApiKeyAuthMiddleware.mjs';

dotenv.config();
const router = Router();

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();

        return res.status(200).send(StandardResponse(
            true,
            "Rest countries all",
            data,
            null
        ));
        
    } catch (error) {
        console.error('Error fetching countries:', error);
        return res.status(500).send(StandardResponse(
            false,
            "Failed to fetch country data",
            null,
            error.message
        ));
    }
});

export default router;
