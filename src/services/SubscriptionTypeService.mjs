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

}

export default SubscriptionTypeService;
