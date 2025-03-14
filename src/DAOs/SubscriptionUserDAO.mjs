import { getDatabasePool } from '../config/SQLCon.mjs';
import dotenv from 'dotenv';

dotenv.config();
const pool = await getDatabasePool();

class SubscriptionUserDAO {
    constructor () {
    }

    // Subscribe user
    async create(subscriptionUserModel) {
        try {    
            await pool.query(`
                INSERT INTO subscription_users (
                    subscription_id, 
                    user_id
                ) values (?, ?)
            `, [subscriptionUserModel.subscriptionId, subscriptionUserModel.userId]);

        } catch (error) {
            throw error;
        }
    }

    // Get user subscription
    async getUserSubscription(userId) {
        try {
            const [row] = await pool.query("SELECT subscription_id FROM subscription_users WHERE user_id = ?", [userId]);
            if (row.length > 0) {
                return row[0].subscription_id;
            }

            // Defaul free sub id
            return 1;
            
        } catch (error) {
            throw error;
        }
    }

}

export default SubscriptionUserDAO;