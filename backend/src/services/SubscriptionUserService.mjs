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

    // Get subscrib users count 
    async getSubscribeUsersCount() {
        try {
            const subscribeUsers = await this.subscriptionUserDAO.getSubscribeUsersCount();
            return subscribeUsers;
            
        } catch (error) {
            throw error;
        }
    }

    // Get income
    async getIncome() {
        try {
            const income = await this.subscriptionUserDAO.getIncome();
            return income;
            
        } catch (error) {
            throw error;
        }
    }

}

export default SubscriptionUserService;
