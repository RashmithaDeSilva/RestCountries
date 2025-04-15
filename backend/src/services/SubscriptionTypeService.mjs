import SubscriptionTypesDAO from '../DAOs/SubscriptionTypesDAO.mjs';
import dotenv from 'dotenv';

dotenv.config();

class SubscriptionTypeService {
    constructor() {
        this.subscriptionTypesDAO = new SubscriptionTypesDAO();
    }

    // Subscribe user
    async getAllSubscriptionTypes() {
        try {
            return await this.subscriptionTypesDAO.getAllSubscriptionTypes();

        } catch (error) {
            throw error;
        }
    }

    // // Get subscription type
    // async getSubscriptionType(subId) {
    //     try {
    //         return await this.subscriptionTypesDAO.getSubscriptionType(subId);
            
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // Get subscription types count
    async getSubscriptionTypesCount() {
        try {
            const subscriptionTypesCount = await this.subscriptionTypesDAO.getSubscriptionTypesCount();
            return subscriptionTypesCount;
            
        } catch (error) {
            throw error;
        }
    }

    // Get subscription request limit
    async getSubscriptionRequestLimit(subscriptionId) {
        try {
            const getSubscriptionRequestLimit = await this.subscriptionTypesDAO.getSubscriptionRequestLimit(subscriptionId);
            return getSubscriptionRequestLimit;
            
        } catch (error) {
            throw error;
        }
    }
}

export default SubscriptionTypeService;
