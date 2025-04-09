import { Router } from 'express';
import dotenv from 'dotenv';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import isAuthenticated from '../middlewares/UserAuthMiddleware.mjs';

dotenv.config();
const router = Router();



export default router;
