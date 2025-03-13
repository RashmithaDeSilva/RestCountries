import { Router } from 'express';
import dotenv from 'dotenv';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import Response from '../utils/Response.mjs';
import UserValidationSchema from '../utils/validations/UserValidationSchema.mjs';
import UserService from '../services/UserService.mjs';
import DatabaseErrors from '../utils/errors/DatabaseErrors.mjs';
import passport from 'passport';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import isAuthenticated from '../middlewares/AuthMiddleware.mjs';

dotenv.config();
const router = Router();
const userService = new UserService();

/**
 * @swagger
 * /api/v1/auth/user:
 *   get:
 *     summary: "Get user status"
 *     description: "This endpoint retrieves the status of the currently authenticated user."
 *     tags:
 *       - "User"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved user status"
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
 *                   example: "User status."
 *                 data:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     surname:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     contactNumber:
 *                       type: string
 *                       example: "+94761234567"
 *                     passwordHash:
 *                       type: integer
 *                       example: 0
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     verify:
 *                       type: boolean
 *                       example: false
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       401:
 *         description: "Unauthorized. User must be authenticated."
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
 *                   example: "Authentication failed"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 error:
 *                   type: "null"
 *                   example: "Invalid email or password."
 */
router.get('/', isAuthenticated, async (req, res) => {
    console.log(req.user);
    res.status(200).send(Response.StandardResponse(
        true,
        "User status.",
        req.user,
        null
    ));
});



export default router;
