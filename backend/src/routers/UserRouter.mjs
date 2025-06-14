import { Router } from 'express';
import dotenv from 'dotenv';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import UserValidationSchema from '../utils/validations/UserValidationSchema.mjs';
import UserService from '../services/UserService.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import isAuthenticated from '../middlewares/UserAuthMiddleware.mjs';
import DashboardService from '../services/DashboadService.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';

dotenv.config();
const ENV = process.env.ENV;
const router = Router();
const userService = new UserService();
const dashboardService = new DashboardService();

/**
 * @swagger
 * /api/v1/auth/user/info:
 *   get:
 *     summary: "Get user status"
 *     description: "This endpoint retrieves the status of the currently authenticated user."
 *     tags:
 *       - "User"
 *     security:
 *       - cookieAuth: []
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
 *                   type: object
 *                   example: {"redirect":"/api/v1/auth"}
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.get('/info', isAuthenticated, (req, res) => {
    return res.status(200).send(StandardResponse(
        true,
        "User info.",
        req.user,
        null
    ));
});

/**
 * @swagger
 * /api/v1/auth/user/update:
 *   put:
 *     summary: "Update user information"
 *     description: "This endpoint allows the authenticated user to update their personal information, such as first name, surname, email, and contact number."
 *     tags:
 *       - "User"
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: "User data to be updated."
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               surname:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               contact_number:
 *                 type: string
 *                 example: "+94761234567"
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
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
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: "Internal Server Error"
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.put('/update', isAuthenticated, [
    checkSchema({
        ...UserValidationSchema.firstNameValidation(),
        ...UserValidationSchema.surnameValidation(),
        ...UserValidationSchema.emailValidation(),
        ...UserValidationSchema.contactNumberValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/user/update/', errors);
    }

    const data = matchedData(req);
    data.id = req.user.id

    try {
        await userService.updateUser(data);

    } catch (error) {
        return await ErrorResponse(error, res, '/user/update/', data);
    }

    return ENV === "DEV" ? res.status(200).send(StandardResponse(
        true,
        "User update successfully.",
        null,
        null
    )) : res.sendStatus(204);
});

/**
 * @swagger
 * /api/v1/auth/user/changepassword:
 *   patch:
 *     summary: "Change user password"
 *     description: "Allows an authenticated user to change their password by providing the old password and a new password."
 *     tags:
 *       - "User"
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: "User password change request."
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               old_password:
 *                 type: string
 *                 format: password
 *                 example: "oldPassword123"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "NewStrongPassword123!"
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 example: "NewStrongPassword123!"
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
 *     responses:
 *       200:
 *         description: "Password changed successfully."
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
 *                   example: "Password change successfully."
 *                 data:
 *                   type: "null"
 *                   example: null
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
 *       400:
 *         description: "Validation error (e.g., incorrect old password, mismatched new passwords, or hash verification failure)"
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
 *         description: "User not found"
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
 *                   example: "User not found."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * 
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
 *                   example: "Internal server error."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * 
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.patch('/changepassword', isAuthenticated, [
    checkSchema({
        ...UserValidationSchema.oldPasswordValidation(),
        ...UserValidationSchema.passwordValidation(),
        ...UserValidationSchema.confirmPasswordValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/user/changepassword', errors);
    }

    const data = matchedData(req);
    data.id = req.user.id

    try {
        await userService.changePassword(data);

    } catch (error) {
        return await ErrorResponse(error, res, '/user/changepassword', data);
    }

    return ENV === "DEV" ? res.status(200).send(StandardResponse(
        true,
        "Password change successfully.",
        null,
        null
    )) : res.sendStatus(204);
});

/**
 * @swagger
 * /api/v1/auth/user/dashboard:
 *   get:
 *     summary: Get user dashboard data
 *     description: Retrieves dashboard statistics specific to the authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User dashboard data retrieved successfully
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
 *                   example: User dashboard
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscriptionPlan:
 *                       type: string
 *                       example: Free
 *                     incluge:
 *                       type: integer
 *                       example: 1000
 *                     apiKyeUsage:
 *                       type: integer
 *                       example: 0
 *                 errors:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       401:
 *         description: Unauthorized - User not authenticated.
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
 *                   example: Authentication failed
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example: { "redirect": "/api/v1/auth" }
 *       400:
 *         description: Validation error (e.g., incorrect old password, mismatched new passwords, or hash verification failure)
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
 *                   example: Validation error.
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
 *         description: User not found
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
 *                   example: User not found.
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error.
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
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const dashboard = await dashboardService.getUserDashboard(req.user.id);
        return res.status(200).send(StandardResponse(
            true,
            "User dashboard",
            dashboard,
            null
        ));

    } catch (error) {
        return await ErrorResponse(error, res, '/user/dashboard', data);
    }
})

/**
 * @swagger
 * /api/v1/auth/user/status:
 *   get:
 *     summary: Get user authentication status
 *     description: Checks if the user is authenticated and returns a confirmation status.
 *     tags:
 *       - User
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated
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
 *                   example: User status.
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       401:
 *         description: Unauthorized - User is not authenticated
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
 *                   example: Authentication failed
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example: { "redirect": "/api/v1/auth" }
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error.
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
router.get('/status', isAuthenticated, async (req, res) => {
    return res.status(200).send(StandardResponse(
        true,
        "User status.",
        null,
        null
    ));
});

export default router;
