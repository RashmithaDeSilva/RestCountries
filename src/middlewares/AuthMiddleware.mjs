import Response from '../utils/Response.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import dotenv from 'dotenv';

dotenv.config();

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();  // User is authenticated, proceed to the next middleware/route
    }
    
    return res.status(401).send(Response.StandardResponse(
        false,
        CommonErrors.AUTHENTICATION_FAILED,
        null,
        { redirect: `/api/${ process.env.API_VERSION }/auth` }
    ));
};

export default isAuthenticated;
