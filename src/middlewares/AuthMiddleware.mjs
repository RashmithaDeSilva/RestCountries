import StandardResponse from '../utils/responses/StandardResponse.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import dotenv from 'dotenv';

dotenv.config();

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();  // User is authenticated, proceed to the next middleware/route
    }
    ErrorResponse(new Error(CommonErrors.AUTHENTICATION_FAILED), res);
};

export default isAuthenticated;
