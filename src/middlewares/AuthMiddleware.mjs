import jwt from 'jsonwebtoken';
import SessionService from '../services/SessionService.mjs';
import dotenv from 'dotenv';

dotenv.config();

const sessionService = new SessionService();

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.sessionId || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).send(Response.StandardResponse(
                false,
                "Unauthorized.",
                null,
                "No token provided"
            ));
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SESSION_SECRET);
        const session = await sessionService.getSession(decoded.sessionId);
        
        if (!session) {
            return res.status(401).send(Response.StandardResponse(
                false,
                "Unauthorized.",
                null,
                "Invalid session"
            ));
        }

        req.user = { id: session.userId, ...session.sessionData };
        next();
        
    } catch (error) {
        return res.status(401).send(Response.StandardResponse(
            false,
            "Unauthorized.",
            null,
            "Invalid token"
        ));
    }
};

export default authMiddleware;

