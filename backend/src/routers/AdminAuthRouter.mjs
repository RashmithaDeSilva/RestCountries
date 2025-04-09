import { Router } from 'express';
import dotenv from 'dotenv';
import { validationResult, checkSchema } from 'express-validator';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import AdminValidationSchema from '../utils/validations/AdminValidationSchema.mjs';
import DatabaseErrors from '../utils/errors/DatabaseErrors.mjs';
import passport from 'passport';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import isAuthenticated from '../middlewares/AdminAuthMiddleware.mjs';
import { promisify } from 'util';

dotenv.config();
const router = Router();

/**
 * @swagger
 * /api/v1/auth/admin/login:
 *   post:
 *     summary: Admin Login
 *     description: Authenticates an admin using email and password. Returns a session upon success.
 *     tags:
 *       - Admin Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *                 description: Admin's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password12345
 *                 description: Admin's password
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
 *                 message:
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
 *                 message:
 *                   type: string
 *                   example: Validation error.
 *                 data:
 *                   type: string
 *                   nullable: true
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       value:
 *                         type: string
 *                       msg:
 *                         type: object
 *                       path:
 *                         type: string
 *                       location:
 *                         type: string
 *                   example:
 *                     - type: "field"
 *                       value: "admin@example"
 *                       msg: { error: "Invalid email format!" }
 *                       path: "email"
 *                       location: "body"
 *       401:
 *         description: Invalid email or password
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
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: Invalid email or password.
 *       500:
 *         description: Internal Server Error
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
        ...AdminValidationSchema.emailValidation(),
        ...AdminValidationSchema.passwordValidation(),
    }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, null, errors);
        }
        next();
    },
    async (req, res, next) => {
        passport.authenticate('local-admin', async (error, admin) => {
            if (error) {
                return await ErrorResponse(error, res, '/auth/admin/login');
            }
            if (!admin) {
                return await ErrorResponse(new Error(DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD), res);
            }

            req.logIn(admin, async (loginErr) => {
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
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out the admin
 *     description: Ends the admin session and logs the user out.
 *     tags:
 *       - Admin Authentication
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
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
 *                   example: Successfully logged out
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       401:
 *         description: Unauthorized - User not authenticated
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
 *                   type: string
 *                   nullable: true
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
 *                   example: Internal server error
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: string
 *                   nullable: true
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
        return await ErrorResponse(error, res, '/auth/admin/logout/');
    }
});

export default router;
