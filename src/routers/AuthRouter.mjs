import { Router } from 'express';
import dotenv from 'dotenv';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import Response from '../utils/Response.mjs';
import UserValidationSchema from '../utils/validations/UserValidationSchema.mjs';
import UserService from '../services/UserService.mjs';
import DatabaseErrors from '../utils/errors/DatabaseErrors.mjs';
import passport from 'passport';
import CommonErrors from '../utils/errors/CommonErrors.mjs';

dotenv.config();
const router = Router();
const userService = new UserService();

/**
 * @swagger
 * /api/v1/auth:
 *   post:
 *     summary: Authenticate user
 *     description: Authenticates a user using email and password, returning a session if successful.
 *     tags:
 *       - Authentication
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
 *                 example: user55@example.com
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456789012
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
router.post('/', [
    checkSchema({
        ...UserValidationSchema.emailValidation(),
        ...UserValidationSchema.passwordValidation(),
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send(Response.StandardResponse(
                false,
                "Validation error.",
                null,
                errors.array()
            ));
        }
        next();
    },
    (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return res.status(500).send(Response.StandardResponse(
                    false,
                    CommonErrors.INTERNAL_SERVER_ERROR,
                    null,
                    err.message
                ));
            }
            if (!user) {
                return res.status(401).send(Response.StandardResponse(
                    false,
                    CommonErrors.AUTHENTICATION_FAILED,
                    null,
                    info // This comes from `done(null, false, DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD)`
                ));
            }

            req.logIn(user, (loginErr) => {
                if (loginErr) {
                    return res.status(500).send(Response.StandardResponse(
                        false,
                        CommonErrors.AUTHENTICATION_FAILED,
                        null,
                        loginErr.message
                    ));
                }
                return res.status(200).send(Response.StandardResponse(
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
 *      - Authentication
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
 *               surname:
 *                 type: string
 *                 description: The surname of the user.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the user.
 *               contact_number:
 *                 type: string
 *                 description: The user's contact number.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password.
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 description: Confirmation of the user's password.
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
        return res.status(400).send(Response.StandardResponse(
            false,
            "Validation error.",
            null,
            errors.array()
        ));
    }

    const data = matchedData(req);
    let userId;

    try {
        userId = await userService.createUser(data);
    } catch (error) {
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
        "User registered successfully.",
        {
            user_id: userId,
        },
        null
    ));
});

export default router;
