import { getDatabasePool } from '../config/SQLCon.mjs';
import dotenv from 'dotenv';

dotenv.config();
const pool = await getDatabasePool();

class ApiKeyDAO {
    constructor () {
    }

    // Create api key
    async create(apiKeyModel) {
        try {    
            await pool.query(`
                INSERT INTO api_keys (
                    key_name, 
                    key, 
                    user_id
                ) values (?, ?, ?)
            `, [apiKeyModel.keyName, apiKeyModel.key, apiKeyModel.userId]);

        } catch (error) {
            throw error;
        }
    }

    // Check api key is exists
    async isKeyExists(apiKey) {
        const [row] = await pool.query(`SELECT key FROM api_keys WHERE key = ?`, [apiKey]);
        return row.length > 0;
    }

    // Check api key is exists
    async isKeyExistsByUserIdAndKeyName(userId, name) {
        const [row] = await pool.query(`SELECT key_name FROM api_keys WHERE user_id = ? AND key_name = ?`, [userId, name]);
        return row.length > 0;
    }

    // Get API key
    async getApiKeysByUserId(userId) {
        try {
            const [row] = await pool.query(`SELECT key, key_name FROM api_keys WHERE user_id = ?`, [userId]);
            return row.length === 0 ? null : row;

        } catch (error) {
            throw error;
        }
    }

    // Chnge api key name
    async changeApiKeyByUserIdAndName(userId, oldName, newName) {
        try {
            await pool.query(`
                UPDATE api_keys 
                SET key_name = ?
                WHERE user_id = ? AND key_name = ?
            `, [newName, userId, oldName]);

        } catch (error) {
            throw error;
        }
    }
}

export default ApiKeyDAO;