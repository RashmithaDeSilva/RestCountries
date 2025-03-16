import redisCacheStore from '../stores/CacheStore.mjs';

class CacheStoreDAO {
    constructor () {
    }

    // Save data on redis
    async save(cacheStoreModel) {
        try {
            await redisCacheStore.set(cacheStoreModel.key, cacheStoreModel.value);
            
        } catch (error) {
            throw error
        }
    }
}

export default CacheStoreDAO;