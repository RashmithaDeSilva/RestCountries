import { getDatabasePool } from '../config/SQLCon.mjs';

const pool = await getDatabasePool();

class ApiKeyUsageDAO {
    constructor () {
    }

    // Check user can request
    async isUserCanRequest(userId) {
        try {
            const [row] = await pool.query(`
                SELECT 
                    aku.user_id,
                    aku.key_usage,
                    st.api_request_limit,
                    -- CASE 
                    --     WHEN st.api_request_limit = -1 THEN 'Unlimited'
                    --     WHEN aku.key_usage >= st.api_request_limit THEN 'Exceeded'
                    --     ELSE 'Within Limit'
                    -- END AS usage_status,
                    CASE 
                        WHEN st.api_request_limit = -1 THEN 1
                        WHEN aku.key_usage < st.api_request_limit THEN 1
                        ELSE 0
                    END AS status
                FROM api_key_usage aku
                JOIN subscription_types st ON aku.subscription_type_id = st.id
                WHERE aku.user_id = ?;
            `, [userId]);
            return row[0].status > 0;

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    // Update api key usage
    async updateApiKeyUsage(userId) {
        try {
            await pool.query(`
                UPDATE api_key_usage 
                SET key_usage = key_usage + 1 
                WHERE user_id = ?;
            `, [userId]);
            
        } catch (error) {
            throw error;
        }
    }
}

export default ApiKeyUsageDAO;