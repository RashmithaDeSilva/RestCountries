import { Router } from 'express';
import dotenv from 'dotenv';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import isAuthenticated from '../middlewares/ApiKeyAuthMiddleware.mjs';

dotenv.config();
const router = Router();

router.get('/', isAuthenticated, (req, res) => {
    return res.status(200).send(StandardResponse(
        true,
        "User status.",
        req.user,
        null
    ));
});

export default router;
