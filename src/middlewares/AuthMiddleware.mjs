import CommonErrors from '../utils/errors/CommonErrors.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import dotenv from 'dotenv';

dotenv.config();

const isAuthenticated = async (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();  // User is authenticated, proceed to the next middleware/route
    }
    return await ErrorResponse(new Error(CommonErrors.AUTHENTICATION_FAILED), res, 'local auth middleware');
};

export default isAuthenticated;
