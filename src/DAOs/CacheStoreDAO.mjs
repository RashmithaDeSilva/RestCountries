import redisClient from '../config/RedisCon.mjs';

class CacheStoreDAO {
    constructor() {}

    // Save data in Redis
    async save(cacheStoreModel) {
        try {
            // Using RedisJSON for structured storage
            await redisClient.sendCommand([
                "JSON.SET", 
                cacheStoreModel.key, 
                "$", // Store at root ($)
                JSON.stringify(cacheStoreModel.value)
            ]);
            
        } catch (error) {
            throw error;
        }
    }

    // Retrieve all cached countries
    async getAllCountries() {
        try {
            const result = await redisClient.sendCommand(["JSON.GET", "cache:countries"]);
            return result ? JSON.parse(result) : null;

        } catch (error) {
            throw error;
        }
    }
}

export default CacheStoreDAO;
