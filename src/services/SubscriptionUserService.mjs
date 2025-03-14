import SubscriptionUserDAO from '../DAOs/SubscriptionUserDAO.mjs';
import dotenv from 'dotenv';

dotenv.config();

class SubscriptionUserService {
    constructor() {
        this.subscriptionUserDAO = new SubscriptionUserDAO();
    }

    // Get user subscription
    async getUserSubscription(userId) {
        try {
            return await this.subscriptionUserDAO.getUserSubscription(userId);

        } catch (error) {
            throw error;
        }
    }

}

export default SubscriptionUserService;
