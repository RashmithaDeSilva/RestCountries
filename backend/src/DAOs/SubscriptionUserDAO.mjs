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

    // Get subscribe user conut
    async getSubscribeUsersCount() {
        try {
            const [row] = await pool.query(`
                SELECT COUNT(*) AS paid_users_count
                FROM subscription_users
                WHERE subscription_id != 1
            `);
            return row[0].paid_users_count;

        } catch (error) {
            throw error;
        }
    }

    // Get income
    async getIncome() {
        try {
            const [row] = await pool.query(process.env.ENV === "DEV" ? 
                `
                SELECT 
                    SUM(st.subscription_price) AS income
                FROM 
                    subscription_users su
                JOIN 
                    subscription_types st ON su.subscription_id = st.id
                WHERE 
                    su.subscription_id != 1
                    AND su.expiry_time > DATETIME('now');

                ` : `
                SELECT 
                    SUM(st.subscription_price) AS income
                FROM 
                    subscription_users su
                JOIN 
                    subscription_types st ON su.subscription_id = st.id
                WHERE 
                    su.subscription_id != 1
                    AND su.expiry_time > NOW();
            `);
            return row[0].income === null ? 0 : row[0].income;

        } catch (error) {
            throw error;
        }
    }
}

export default SubscriptionUserDAO;