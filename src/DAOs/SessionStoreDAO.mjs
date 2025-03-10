import { sessionStore } from '../config/RedisCon.mjs';
import { v4 as uuidv4 } from 'uuid';
import SessionModel from '../models/SessionModel.mjs';
import dotenv from 'dotenv';

dotenv.config();

class SessionStore {
    constructor () {
    }

    async createSession (sessionModel) {
        try {
            const sessionKey = uuidv4();
            const userId = sessionModel.userId;
            const sessionData = sessionModel.sessionData;
            const sessionValue = JSON.stringify({ userId, ...sessionData });

            await sessionStore.set(sessionKey, sessionValue, {
                EX: process.env.SESSION_EX_TIME,
            });
            return sessionKey;

        } catch (error) {
            throw error;
        }
    }

    async getSession (sessionKey) {
        try {
            const sessionValue = await sessionStore.get(sessionKey);
            return sessionValue ? new SessionModel(sessionValue.userId, sessionValue.sessionData) : null;

        } catch (error) {
            throw error;
        }
    }

    async deleteSession (sessionKey) {
        try {
            await sessionStore.del(sessionKey);

        } catch (error) {
            throw error;
        }
    }
}

export default SessionStore;