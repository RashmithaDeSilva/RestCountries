import SessionStoreDAO from '../DAOs/SessionStoreDAO.mjs';
import ErrorLogService from './ErrorLogService.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import dotenv from 'dotenv';
import SessionModel from '../models/SessionModel.mjs';

dotenv.config();

class SessionService {
    constructor () {
        this.sessionStoreDAO = SessionStoreDAO;
        this.errorLogService = new ErrorLogService();
    }

    // Create new session
    async createSession (userId, data) {
        try {
            const sessionId = await this.sessionStoreDAO.createSesion(
                new SessionModel(userId, data));
            return sessionId;

        } catch (error) {
            if (process.env.ENV === "DEV") {
                throw error;
            }

            await this.errorLogService.createLog("SessionService.createSession", error, data);
            throw new Error(CommonErrors.INTERNAL_SERVER_ERROR);
        }
    }

    // Get session
    async getSession (sessionKey) {
        try {
            const session = await this.sessionStoreDAO.getSession(sessionKey);
            return session;
            
        } catch (error) {
            if (process.env.ENV === "DEV") {
                throw error;
            }

            await this.errorLogService.createLog("SessionService.getSession", error, data);
            throw new Error(CommonErrors.INTERNAL_SERVER_ERROR);
        }
    }
}

export default SessionService;