import { getDatabasePool } from '../config/SQLCon.mjs';
import dotenv from 'dotenv';
import ApiKeyModel from '../models/ApiKeyModel.mjs';

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
                    api_key, 
                    user_id
                ) values (?, ?, ?)
            `, [apiKeyModel.keyName, apiKeyModel.key, apiKeyModel.userId]);

        } catch (error) {
            throw error;
        }
    }

    // Check api key is exists
    async isKeyExists(apiKey) {
        const [row] = await pool.query(`SELECT api_key FROM api_keys WHERE api_key = ?`, [apiKey]);
        return row.length > 0;
    }

    // Check api key is exists
    async isKeyExistsByUserIdAndKeyName(userId, name) {
        const [row] = await pool.query(`SELECT key_name FROM api_keys WHERE user_id = ? AND key_name = ?`, [userId, name]);
        return row.length > 0;
    }

    // Get API keys by user id
    async getApiKeysByUserId(userId) {
        try {
            const [row] = await pool.query(`SELECT api_key, key_name FROM api_keys WHERE user_id = ?`, [userId]);
            return row.length === 0 ? null : row;

        } catch (error) {
            throw error;
        }
    }

    // Get API key by user id and key name
    async getApiKeyByUserIdAndKeyName(userId, name) {
        try {
            const [row] = await pool.query(`SELECT api_key FROM api_keys WHERE user_id = ? AND key_name = ?`, [userId, name]);
            return row.length === 0 ? null : new ApiKeyModel(userId, name, row[0].api_key);

        } catch (error) {
            throw error;
        }
    }

    // Chnge api key name
    async changeApiKeyNameByUserIdAndName(userId, oldName, newName) {
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

    // Chnge api key
    async changeApiKeyByUserIdAndName(userId, apiKeyName, apiKey) {
        await pool.query(`
            UPDATE api_keys 
            SET api_key = ?
            WHERE user_id = ? AND key_name = ?
        `, [apiKey, userId, apiKeyName]);
    }

    // Get user's current api key count
    async getUsersCurrentApiKeyCount(userId) {
        try {
            const [row] = await pool.query(`SELECT COUNT(*) AS key_count FROM api_keys WHERE user_id = ?`, [userId]);
            return row[0].key_count;

        } catch (error) {
            throw error;
        }
    }

    
}

export default ApiKeyDAO;