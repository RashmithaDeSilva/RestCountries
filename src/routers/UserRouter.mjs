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
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
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

/**
 * @swagger
 * /api/v1/auth/user/update:
 *   post:
 *     summary: "Update user information"
 *     description: "This endpoint allows the authenticated user to update their personal information, such as first name, surname, email, and contact number."
 *     tags:
 *       - "User"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: "User data to be updated."
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               surname:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               contactNumber:
 *                 type: string
 *                 example: "+94761234567"
 *     responses:
 *       200:
 *         description: "Successfully updated user information"
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
 *                   example: "User updated successfully."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: "Validation error or email already exists"
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
 *         description: "Internal server error"
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
 *                   example: "Internal Server Error"
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */
router.post('/update', isAuthenticated, [
    checkSchema({
        ...UserValidationSchema.firstNameValidation(),
        ...UserValidationSchema.surnameValidation(),
        ...UserValidationSchema.emailValidation(),
        ...UserValidationSchema.contactNumberValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(Response.StandardResponse(
            false,
            "Validation error.",
            null,
            errors.array()
        ));
    }

    const data = matchedData(req);
    data.id = req.user.id

    try {
        await userService.updateUser(data);

    } catch (error) {
        console.log(error);
        if (error.message === DatabaseErrors.EMAIL_ALREADY_EXISTS) {
            return res.status(400).send(Response.StandardResponse(
                false,
                "Validation error.",
                null,
                error.message
            ));
        }
        return res.status(500).send(Response.StandardResponse(
            false,
            "Internal server error.",
            null,
            error.message
        ));
    }

    res.status(201).send(Response.StandardResponse(
        true,
        "User update successfully.",
        null,
        null
    ));
});

export default router;
