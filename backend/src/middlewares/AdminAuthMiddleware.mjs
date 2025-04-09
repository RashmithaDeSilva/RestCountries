import CommonErrors from '../utils/errors/CommonErrors.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import { AdminRollTypes } from '../utils/enums/AdminRollTypes.mjs';

const isAuthenticated = async (req, res, next) => {
    if (req.isAuthenticated() 
        && (req.user?.roll === AdminRollTypes.SUPER_ADMIN 
        || req.user?.roll === AdminRollTypes.ADMIN)) {
        return next();  // Admin is authenticated, proceed to the next middleware/route
    }
    return await ErrorResponse(new Error(CommonErrors.AUTHENTICATION_FAILED), res, 'local admin auth middleware');
};

export default isAuthenticated;
