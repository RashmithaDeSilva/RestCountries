import { getDatabasePool } from '../config/SQLCon.mjs';
import SubscriptionTypeModel from '../models/SubscriptionTypeModel.mjs';
import dotenv from 'dotenv';

dotenv.config();
const pool = await getDatabasePool();

class SubscriptionTypesDAO {
    constructor () {
    } 

    // Get all subscription types
    async getAllSubscriptionTypes() {
        try {
            const [row] = await pool.query("SELECT * FROM subscription_types");
            if (row.length > 0) {
                const subscriptionTypeModelSet = [];

                for (let i=0; i<row.length; i++) {
                    subscriptionTypeModelSet.push(new SubscriptionTypeModel(
                        row[i].id,
                        row[i].subscription_name,
                        row[i].subscription_price,
                        row[i].subscription_price_currency,
                        row[i].api_request_limit,
                        row[i].api_key_limit,
                        row[i].description,
                        row[i].function_description
                    ));
                }

                return subscriptionTypeModelSet;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    // Get subscription types
    async getSubscriptionType(subId) {
        try {
            const [row] = await pool.query("SELECT * FROM subscription_types WHERE id = ?", [subId]);
            if (row.length > 0) {
                return new SubscriptionTypeModel(
                    row[0].id,
                    row[0].subscription_name,
                    row[0].subscription_price,
                    row[0].subscription_price_currency,
                    row[0].api_request_limit,
                    row[0].api_key_limit,
                    row[0].description,
                    row[0].function_description
                );
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    // Get subscription types count
    async getSubscriptionTypesCount() {
        try {
            const [row] = await pool.query(`SELECT COUNT(*) AS count FROM subscription_types`);
            return row[0].count;

        } catch (error) {
            throw error;
        }
    }
    
    // Get subscription request limit
    async getSubscriptionRequestLimit(subscriptionId) {
        try {
            const [row] = await pool.query(`SELECT api_request_limit FROM subscription_types WHERE id = ?`, [subscriptionId]);
            return row[0].api_request_limit;

        } catch (error) {
            throw error;
        }
    }
}

export default SubscriptionTypesDAO;