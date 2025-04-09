import { Router } from 'express';
import dotenv from 'dotenv';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import UserValidationSchema from '../utils/validations/UserValidationSchema.mjs';
import UserService from '../services/UserService.mjs';
import DatabaseErrors from '../utils/errors/DatabaseErrors.mjs';
import passport from 'passport';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import isAuthenticated from '../middlewares/UserAuthMiddleware.mjs';
import { promisify } from 'util';

dotenv.config();
const router = Router();
const userService = new UserService();

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate user
 *     description: Authenticates a user using email and password, returning a session if successful.
 *     tags:
 *       - User Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password12345
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 messesge:
 *                   type: string
 *                   example: Authenticated.
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 messesge:
 *                   type: string
 *                   example: Validation error.
 *                 data:
 *                   type: string
 *                   nullable: true
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                   example: [{ "type": "field", "value": "user@example", "msg": { "error": "Invalid email format!" }, "path": "email", "location": "body" }]
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 messesge:
 *                   type: string
 *                   example: Authentication failed
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: "Invalid email or password."
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
 *                 messesge:
 *                   type: string
 *                   example: Internal Server Error
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: Internal Server Error
 */
router.post('/login', [
    checkSchema({
        ...UserValidationSchema.emailValidation(),
        ...UserValidationSchema.passwordValidation(),
    }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, null, errors);
        }
        next();
    },
    async (req, res, next) => {
        passport.authenticate('local-user', async (error, user) => {
            if (error) {
                return await ErrorResponse(error, res, '/auth/login');
            }
            if (!user) {
                return await ErrorResponse(new Error(DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD), res);
            }

            req.logIn(user, async (loginErr) => {
                if (loginErr) {
                    return await ErrorResponse(new Error(CommonErrors.AUTHENTICATION_FAILED), res);
                }
                return res.status(200).send(StandardResponse(
                    true,
                    "Authenticated.",
                    null,
                    null
                ));
            });
        })(req, res, next);
    }
]);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Validates user input and registers a new user if valid.
 *     tags:
 *      - User Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - surname
 *               - email
 *               - contact_number
 *               - password
 *               - confirm_password
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: The first name of the user.
 *                 example: first name
 *               surname:
 *                 type: string
 *                 description: The surname of the user.
 *                 example: surname
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the user.
 *                 example: user@example.com
 *               contact_number:
 *                 type: string
 *                 description: The user's contact number.
 *                 example: +94761234567
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password.
 *                 example: password12345
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 description: Confirmation of the user's password.
 *                 example: password12345
 *     responses:
 *       201:
 *         description: User registered successfully.
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
 *                   example: "User registered successfully."
 *                 data:
 *                   type: object
 *                   example: { user_id: 12345 }
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: Validation error or duplicate email.
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
 *                     example: "Email already exists"
 *       500:
 *         description: Internal server error.
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
 *                   example: "Unexpected error occurred."
 */
router.post('/register', [
    checkSchema({
        ...UserValidationSchema.firstNameValidation(),
        ...UserValidationSchema.surnameValidation(),
        ...UserValidationSchema.emailValidation(),
        ...UserValidationSchema.contactNumberValidation(),
        ...UserValidationSchema.passwordValidation(),
        ...UserValidationSchema.confirmPasswordValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, null, errors);
    }

    const data = matchedData(req);
    let userId;

    try {
        userId = await userService.createUser(data);

    } catch (error) {
        return await ErrorResponse(error, res, '/auth/register/', data);
    }

    return res.status(201).send(StandardResponse(
        true,
        "User registered successfully.",
        {
            user_id: userId,
        },
        null
    ));
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: "Log out the user"
 *     description: "Ends the user session and logs the user out."
 *     tags:
 *       - User Authentication
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: "Successfully logged out."
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
 *                   example: "Successfully logged out"
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
router.post('/logout', isAuthenticated, async (req, res) => {
    const logOutAsync = promisify(req.logOut).bind(req);

    try {
        await logOutAsync();
        return res.status(200).send(StandardResponse(
            true,
            "Successfully logged out",
            null,
            null
        ));
    } catch (error) {
        return await ErrorResponse(error, res, '/auth/logout/');
    }
});

export default router;
